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
    # TODO implement
    http_method = event["httpMethod"]
    if http_method == "POST":
        #connect to database
        connection = pymysql.connect(endpoint, user=username, passwd=password, db=database_name)
        cursor = connection.cursor()

        body = json.loads(event['body'])
        search = body["search"];
    
        args = [search]
        resultTuple = pymysql_CallProcAndGetArgs(cursor, 'FindActivitiesWithNamesLike', args)
        
        output = resultTuple[1]
    
        #close database
        cursor.close()
        connection.close()
        
        #response
        return {
            "statusCode": 200,
            "body": json.dumps(output, default=str)
        }
    return {
        "statusCode": 200,
        "body": json.dumps("THERE", default=str)
        }
