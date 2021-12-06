import pymysql
import json
from myutils import *

#configuration values
endpoint = 'tripplannerdb.cmmyrzbau9mp.us-west-2.rds.amazonaws.com'
username = 'admin'
password = 'TripPlanner'
database_name = 'database'


def lambda_handler(event, context):
    # TODO implement
    http_method = event["httpMethod"]
    if http_method == "POST":
        #connect to database
        connection = pymysql.connect(endpoint, user=username, passwd=password, db=database_name)
        cursor = connection.cursor()

        body = json.loads(event['body'])
        
        itineraryQuery = body["itineraryQuery"]
        activityQuery = body["activityQuery"]
        lat = body["latitude"]
        lng = body["longitude"]
        
        dist = body["maxDistanceAway"]
        

        #Call stored procedure with hard coded arguments and store to return to website
        #(CHANGE NUMBER 2 WHEN USER ACCOUNT FEATURE WORKS)        
        args = [itineraryQuery, activityQuery, lat, lng, dist]
        resultTuple = pymysql_CallProcAndGetArgs(cursor, 'FindItinerariesAdvanced', args)
        
        output = resultTuple[1]
    
        #close database
        cursor.close()
        connection.close()
        
        #response
        return {
            "statusCode": 200,
            "body": output
        }
