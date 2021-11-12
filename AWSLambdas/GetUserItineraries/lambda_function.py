import pymysql
import json

from myutils import *

#configuration values
endpoint = 'tripplannerdb.cmmyrzbau9mp.us-west-2.rds.amazonaws.com'
username = 'admin'
password = 'TripPlanner'
database_name = 'database'


"""
Function is used to list all itineraries that the user has created. Used in the account.html page
This should be a GET request with the userid passed along via a cookie, but idk how to get cookies cross origin and i'm not trying to.
"""
def lambda_handler(event, context):
    http_method = event["httpMethod"]
    
    if http_method == 'POST':
        #connect to database
        connection = pymysql.connect(endpoint, user=username, passwd=password, db=database_name)
        cursor = connection.cursor()

        body = json.loads(event['body'])
        id = body["id"];
        

        #Call stored procedure with hard coded arguments and store to return to website
        #(CHANGE NUMBER 2 WHEN USER ACCOUNT FEATURE WORKS)        
        args = [id, None, None]
        resultTuple = pymysql_CallProcAndGetArgs(cursor, 'RetrieveAllItinerariesForUser', args)
        
        output = resultTuple[1]
    
        #close database
        cursor.close()
        connection.close()
        
        #response
        return {
            "statusCode": 200,
            "body": output
        }