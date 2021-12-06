import pymysql
import json

import dateutil.parser

from myutils import *

#configuration values

endpoint = 'tripplannerdb.cmmyrzbau9mp.us-west-2.rds.amazonaws.com'
username = 'admin'
password = 'TripPlanner'
database_name = 'database'


def lambda_handler(event, context):
    http_method = event["httpMethod"]
    
    if http_method == 'POST':
        #connection
        
        connection = pymysql.connect(endpoint, user=username, passwd=password, db=database_name)
        cursor = connection.cursor()

        body = json.loads(event['body'])
        
        userID = int(body["UserID"])
        itineraryID = int(body["ItineraryID"])

        args = [userID, itineraryID, None, None]
        
        resultTuple = pymysql_CallProcAndGetArgs(cursor, "DeleteItinerary", args)
        
        newArgs = resultTuple[0]
        results = resultTuple[1]
        
        connection.commit()
        connection.close()
        
        if (newArgs[2] != 0):
            errData = { "errorCode" : newArgs[2], "errorMessage" : newArgs[3] }
            #409 is a generic conflict error. that's good enough for us.
            return {
                'statusCode': 409,
                'body': json.dumps(errData, default=str)
            }
        else:
            return {
                'statusCode': 200,
                'body': json.dumps('ok')
            }  