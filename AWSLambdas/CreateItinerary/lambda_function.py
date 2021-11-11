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
        title = body['itineraryName']
        startDate = body['startDate']
        endDate = body['endDate']
        userID = body['userID']
        addlInfo = body['additionalInformation']

        startDate = dateutil.parser.isoparse(startDate).date()
        endDate = dateutil.parser.isoparse(endDate).date()

        args = [title, startDate, endDate, userID, addlInfo, None, None, None]
        
        resultTuple = pymysql_CallProcAndGetArgs(cursor, "CreateItinerary", args)
        
        newArgs = resultTuple[0]
        results = resultTuple[1]
        
        connection.commit()
        connection.close()
        
        itineraryID = newArgs[5];
        
        if (itineraryID is None):
            errData = errorData = { "errorCode" : newArgs[6], "errorMessage" : newArgs[7] }
            #409 is a generic conflict error. that's good enough for us.
            return {
                'statusCode': 409,
                'body': json.dumps(errData, default=str)
            }
        else:
            return {
                'statusCode': 200,
                'body': itineraryID
            }  