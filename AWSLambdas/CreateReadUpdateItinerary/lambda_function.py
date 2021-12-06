import pymysql
import json

import dateutil.parser


from myutils import *
from decimal import *

#delete this line
#configuration values

endpoint = 'tripplannerdb.cmmyrzbau9mp.us-west-2.rds.amazonaws.com'
username = 'admin'
password = 'TripPlanner'
database_name = 'database'

def lambda_handler(event, context):
    #if you want to test the object mapper working, switch these two commented/uncommented
    http_method = event["httpMethod"]
    #http_method = 'GET'
    
    #this won't throw a 500 if GET or POST is missing. we probably want to throw so i'll leave this commented out.
    #http_method = event.get("httpMethod")
    
    if http_method == 'GET':
        connection = pymysql.connect(endpoint, user=username, passwd=password, db=database_name)
        cursor = connection.cursor()
        
        #and also switch these two. also is that "page" or "id"?
        itinerar_id = event["queryStringParameters"]["page"]
        #itinerar_id = 32 #this will return a list of 4 acitivities.
        #itinerar_id = 84 #this will return an empty list of activities.
        
        
        #Call stored procedure with hard coded arguments and store to return to website
        args = [itinerar_id, None, None]
        resultTuple = CallProcGetArgsNoFormat(cursor, 'RetrieveSingleItineraryInformation', args)
        
        newArgs = resultTuple[0]
        unformatted = resultTuple[1]

        #close database
        cursor.close()
        connection.close()
        
        if (newArgs[1] == 0 and unformatted):
            #ok, time to ORM this shit. 
        
            #this is ungodly complicated. yay, python!
        
            #SQL doesn't have lists, so it gives us back a "collection of itinerary, activities, and photos", and doesn't know how to differentiate all that. we want a single itinerary
            # with a list of (zero or more) activities, and each activity has a list of (zero or more) photos. So, we want an ORM. But instead, i'm doing it myself. because python!
        
            #ok, so our algorithms above can split a dictionary into "common" and "different" sections, then wrap the different into a list and add it to common, 
            #but they don't actually check to see if everything they are given in the "common" section is actually identical - they just assume it is. Before we can call that, we need to
            #break our result set into groups so that assumption is valid. fortunately, itertools.groupby does exactly that. it also conveniently defines the "common" dictionary we will need.
        
            #our photo filter list.
            photoList = ['PhotoID', 'URL']
            itineraryList = ['ActivityID', 'ActivityName', 'Latitude', 'Longitude', 'Address', 'ItineraryItemID', 'StartTime', 'EndTime', 'AdditionalInformation', 'Photos']
            
            #we have two levels of one to many: Itinerary => ItineraryItems => Photos. 
            #make photos a list in itinerary items 
            ItineraryItemGroup = convertOneToManyToObjectWithList(unformatted, photoList, "PhotoID", "Photos")
            #then make the itinerary items a list in the itinerary. 
            formatted = convertOneToManyToObjectWithList(ItineraryItemGroup, itineraryList, 'ItineraryItemID', "ItineraryItems")
        
            #our query returns a single row, it seems silly to send back a list of size 1. this simply removes the list from our output. tried to do it in json dumps but python threw a fit.
            noList = formatted[0]
            #then dump it to json. 
            output = json.dumps(noList, default = myconverter)
        

            return {
                'statusCode': 200,
                'body': output
            }
        else:
            #the only way this returns null is if the itinerary id does not exist. 
            errorData = {'errorCode' : newArgs[1], 'errorMessage' : newArgs[2]}
            return {
                'statusCode': 404,
                'body': json.dumps(errorData, default=str)
            }
    elif http_method == 'POST':
        
        connection = pymysql.connect(endpoint, user=username, passwd=password, db=database_name)
        cursor = connection.cursor()
        #fortunately, going the otherway will be much simpler. It'll still be complex, but that's all in the database end of things.
        
        body = json.loads(event['body'])
        
        userID = int(body["UserID"])
        itinerary_id = int(body["ItineraryID"]) if body["ItineraryID"] else None
        
        title = body["Title"][:45]
        startDate = body["StartDate"]
        endDate = body["EndDate"]
        descript = body["Description"][:256]
        
        start = dateutil.parser.isoparse(startDate).date()
        end = dateutil.parser.isoparse(endDate).date()
        
        activities = body["ItineraryItems"]
        
        reformattedActivities = [sanitizeActivity(item) for item in activities]
        flattened = [item for sublist in reformattedActivities for item in sublist] #python
        
        args = [userID, itinerary_id, title, start, end, descript, json.dumps(flattened, default=str), None, None]
        
        resultTuple = pymysql_CallProcAndGetArgs(cursor, 'CreateOrEditItinerary', args)
        
        newArgs = resultTuple[0]
        connection.commit()
        #close database
        cursor.close()
        connection.close()

        if (newArgs[7] == 0):
            return {
                'statusCode': 200,
                'body': json.dumps(newArgs[1], default=str)
            }
        else :
            errData = {"errorCode":newArgs[7], "errorMessage": newArgs[8]}
            
            if (newArgs[7] == 2):
                statusCode = 403
            elif (newArgs[7] == 1):
                statusCode = 404
            else:
                statusCode = 409
            return {
                'statusCode': statusCode,
                'body': json.dumps(errData, default=str)
            }
    else:
        return {
            'statusCode': 200,
            'body': "hello"
        }
        
def sanitizeActivity(unformatted):
    
    photos = unformatted["Photos"]
    ct = len(photos)
    if (ct == 0):
        photos.append(None)
        
    getcontext().prec = 4 #this means all our Decimals with have 4 places. 
    ls = []
    
    for photo in photos: #if photo or ct == 1:
        ret = {}
        
        ret["ActivityName"] = unformatted["ActivityName"][:45]
        ret["Latitude"] = Decimal(unformatted["Latitude"])
        ret["Longitude"] = Decimal(unformatted["Longitude"])
        ret["Address"] = unformatted["Address"][:256] if unformatted["Address"] else None
        ret["StartTime"] = dateutil.parser.isoparse(unformatted["StartTime"])
        ret["EndTime"] = dateutil.parser.isoparse(unformatted["EndTime"])
        ret["AdditionalInformation"] = unformatted["AdditionalInformation"][:256] if unformatted["AdditionalInformation"] else None
        ret["Photo"] = photo
        
        ls.append(ret)
    return ls
    