import json
import pymysql

from myutils import *

endpoint = 'tripplannerdb.cmmyrzbau9mp.us-west-2.rds.amazonaws.com'
username = 'admin'
password = 'TripPlanner'
database_name = 'database'


def lambda_handler(event, context):
    # = event["requestContext"]["http"]["method"]
    http_method = event["httpMethod"]
    
    if http_method == 'POST':
        connection = pymysql.connect(host=endpoint, user=username, passwd=password, db=database_name)
        cursor = connection.cursor()

        body = json.loads(event['body'])

        user = body["email"]
        passwd = body["password"]

        args = [user, passwd, -1, 0, ""]
        resultTuple = pymysql_CallProcAndGetArgs(cursor, 'TryLoginGetID', args)
        
        newArgs = resultTuple[0]
        
        cursor.close()
        connection.close()
        
        userID = newArgs[2];

        if (userID is None):
            errorData = { "errorCode" : newArgs[3], "errorMessage" : newArgs[4] }
            #errorData = { "errorCode" : "4", "errorMessage" : "testing" }
            return {
                "statusCode": 401,
                "body": json.dumps(errorData, default=str)
            }
        else:
            return {
                "statusCode": 200,
                "body": userID
            }