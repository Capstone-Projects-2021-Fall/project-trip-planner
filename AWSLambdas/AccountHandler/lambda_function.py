import pymysql
import json
import dateutil.parser;

from myutils import *


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
        user_id = event["queryStringParameters"]["user"]
        #user_id = 4 #this will return a list of 4 acitivities.
        
        #Call stored procedure with hard coded arguments and store to return to website
        args = [user_id, None, None]
        resultTuple = CallProcGetArgsNoFormat(cursor, 'RetrieverUserInfoAndItineraries', args)
        
        newArgs = resultTuple[0]
        unformatted = resultTuple[1]

        #close database
        cursor.close()
        connection.close()
        
        manyColumns = ['ItineraryID', 'ItineraryName', 'StartDate', 'EndDate']
        formatted = convertOneToManyToObjectWithList(unformatted, manyColumns, 'ItineraryID', "Itineraries")
        #our query returns a single row, it seems silly to send back a list of size 1. this simply removes the list from our output. tried to do it in json dumps but python threw a fit.
        noList = formatted[0]
        #then dump it to json. 
        output = json.dumps(noList, default = myconverter)
        
        return {
            'statusCode': 200,
            #'body': json.dumps(resultTuple[1], default=str)
            'body': output
        }
    elif http_method == 'POST':
        #connect to database
        connection = pymysql.connect(endpoint, user=username, passwd=password, db=database_name)
        cursor = connection.cursor()
        
        body = json.loads(event['body'])
        
        userID = int(body["UserID"])
        fName = body["FirstName"][:45]
        lName = body["LastName"][:45]
        temp = body["DateOfBirth"]
        dob = dateutil.parser.isoparse(temp).date() if temp else None
        
        args = [userID, fName, lName, dob, None, None];
        
        resultTuple = pymysql_CallProcAndGetArgs(cursor, 'UpdateUser', args);
        
        connection.commit();
        
        #close database
        cursor.close()
        connection.close()
        newArgs = resultTuple[0]
        
        if (newArgs[4] == 0):
            return {
                'statusCode': 200,
                'body': json.dumps(resultTuple[1], default=str)
            }
        else:
            errData = {"errorCode" : newArgs[4], "errorMessage": newArgs[5]}
            return {
                'statusCode': 404,
                'body': json.dumps(errData, default=myconverter)
            }
    else:
        return {
            'statusCode': 200,
            'body': "hello"
        }