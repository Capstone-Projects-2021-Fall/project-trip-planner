import pymysql
import json

import dateutil.parser
import itertools;

from myutils import *
from decimal import *

#delete this line
#configuration values

endpoint = 'tripplannerdb.cmmyrzbau9mp.us-west-2.rds.amazonaws.com'
username = 'admin'
password = 'TripPlanner'
database_name = 'database'

#Given a dictionary, return a subset of that dictionary based on the filter list, either including or excluding the items in the filter list based on the "exclude" flag
 #Variables:
#   entry: the dictionary to take the subset of.
#   filterList: a list of key names to either include or exclude.
#   exclude: true if we should exclude all the fields in filterList, false if we should exclude all fields NOT in the filterList.
#returns:
#   a dictionary that only contains what we've allowed through the filter, either including or excluding what's part of the filter list. 
def subDictionary(entry, filterList, exclude):
    if exclude:
        return {x: entry[x] for x in entry if x not in filterList}
    else:
        return {x: entry[x] for x in entry if x in filterList}

 #Given a common set of fields (as a dictionary) across a group of results, take the different fields from the result group, convert each to an object and put them in a list
#then add this list to the common dict using the name provided as the new key. if there is only a single entry in the result group and the contents of all the different fields are null, 
#use an empty list instead.
#
#Variables:
#   common: a common group of values that is the same across all the entries in the resultListIterator. 
#   resultListIterator: a subset of our full result list where all of the fields that are defined in common identical. The remaining fields, however, are not. 
#       These non-matching fields will be made into an object and put in a list. If the subset only has 1 item, it may be filled with nulls.
#   name: the name we want to map the list of these non-matching fields to. both common and our return value are dictionaries. 
#   filter: a group of field names from our result set that are not part of the common dict and therefore should be different. It's quicker to provide this than it is to parse common
#   nullCheckField: if an itinerary has no activity items, or an itinerary/activity item has no photos, there will still be one entry in the resultList, but it'll have all nulls. 
#       this is the name of the field we should check against to see if that's the case. This must be a field where null is not allowed in valid data, so typically a primary key.
#returns:
#   a dictionary that contains all the common data as it was passed in, along with a new key that contains a list of all the uncommon data, or the empty list if no such data exists. 
def collapseList(common, resultListIterator, name, filter, nullCheckField):
    #create a copy of the common dict so we don't get an error about modifying a key in a dictionary (common is obtained by iterating over a dictionary).
    ret = dict(common);
    #result list is an iterator, it's lazy. to get the length we need to convert it to a list.
    groupList = list(resultListIterator)
    #null field check. If our length is one and a field that must hold valid data if it were returning a non-empty result has a null value, use the empty list.
    if (len(groupList) == 1 and groupList[0][nullCheckField] == None):
        ret[name] = []
    #otherwise, for each member in the results group list, take a subset of those results that ONLY contains the different fields. 
    #Put these in a list, then add a key (of name) to ret with that list. All in one line because Python!
    else:
        ret[name] = [subDictionary(member, filter, False) for member in groupList]
    return ret;


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
        #itinerar_id = 10 #this will return a list of 4 acitivities.
        #itinerar_id = 20 #this will return an empty list of activities.
        
        
        #Call stored procedure with hard coded arguments and store to return to website
        #(CHANGE NUMBER 2 WHEN USER ACCOUNT FEATURE WORKS)        
        args = [itinerar_id, None, None]
        #resultTuple = pymysql_CallProcAndGetArgs(cursor, 'RetrieveActivitiesForGivenItinerary', args)
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
        
            #Put each unique combination of all the-non photo data into its own group.
            #   these groups will contain one or more entries, depending on the number of photos for that specific group of non-photo data.
            ItineraryItemGroup = itertools.groupby(unformatted, lambda x: subDictionary(x, photoList, True))
        
            #ok, now take all our groups, run them through that splitting and rejoining algorithm, then put them back in our list.
            partiallyFormatted = [collapseList(key,value, "Photos", photoList, 'PhotoID') for key, value in ItineraryItemGroup]
        
            #now, repeat that whole process, now our group should be the itinerary information and our different data is the activity data (with any photos included as a list)
            itineraryList = ['ActivityID', 'ActivityName', 'Latitude', 'Longitude', 'Address', 'ItineraryItemID', 'StartTime', 'EndTime', 'AdditionalInformation', 'Photos']
         
            #there will only be one group here unless the database somehow returned 2+ itineraries, 
            ItineraryGroup = itertools.groupby(partiallyFormatted, lambda x: subDictionary(x, itineraryList, True))
        
            #and split and rejoin. 
            formatted = [collapseList(key,value, "ItineraryItems", itineraryList, 'ItineraryItemID') for key, value in ItineraryGroup]
        
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
                'body': json.dump(errorData, default=str)
            }
    elif http_method == 'POST':
        
        connection = pymysql.connect(endpoint, user=username, passwd=password, db=database_name)
        cursor = connection.cursor()
        #fortunately, going the otherway will be much simpler. It'll still be complex, but that's all in the database end of things.
        
        body = json.loads(event['body'])
        itinerary_id = int(body["ItineraryID"]);
        activities = body["ItineraryItems"]
        
        reformattedActivities = [sanitizeActivity(item) for item in activities]
        flattened = [item for sublist in reformattedActivities for item in sublist] #python
        
        args = [itinerary_id, json.dumps(flattened, default=str), None, None]
        
        resultTuple = pymysql_CallProcAndGetArgs(cursor, 'EditItineraryBasic', args)
        
        newArgs = resultTuple[0]
        
#        for activity in activities:
#            connection = pymysql.connect(endpoint, user=username, passwd=password, db=database_name)
#            cursor = connection.cursor()
#
#            ActivityName = activity["ActivityName"]
#            StartTime = activity["StartTime"]
#            EndTime = activity["EndTime"]
#            Address = activity["Address"]
#            AdditionalInformation = activity["AdditionalInformation"]
#            Latitude = activity["Latitude"]
#            Longitude = activity["Longitude"]
#          
#            StartTime = dateutil.parser.isoparse(StartTime).date()
#            EndTime = dateutil.parser.isoparse(EndTime).date()
#          
#            args = [ActivityName, Latitude, Longitude, Address, itinerary_id, StartTime, EndTime, AdditionalInformation, None, None]
#            resultTuple = pymysql_CallProcAndGetArgs(cursor, 'CreateItineraryItemWithActivity', args)
            
#            connection.commit()
        connection.commit()
        #close database
        cursor.close()
        connection.close()

        if (newArgs[2] == 0):
            return {
                'statusCode': 200,
                'body': json.dumps(resultTuple[1], default=str)
            }
        else :
            errData = {"errorCode":newArgs[2], "errorMessage": newArgs[3]}
            return {
                'statusCode': 409,
                'body': json.dumps(errData, default=str)
            }
    else:
        return {
            'statusCode': 200,
            'body': "hello"
        }
        
def sanitizeActivity(unformatted):
    
    photos = unformatted["Photos"]
    ct = len(photos);
    if (ct == 0):
        photos[0] = None
        ct = 1
        
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
    