import json
import mysql.connector

from myutils import *

endpoint = 'tripplannerdb.cmmyrzbau9mp.us-west-2.rds.amazonaws.com'
username = 'admin'
password = 'TripPlanner'
database_name = 'database'

def lambda_handler(event, context):
    http_method = event["httpMethod"]
    
    if http_method == 'POST':
        connection = pymysql.connect(host=endpoint, user=username, passwd=password, db=database_name)
        cursor = connection.cursor()

        body = json.loads(event['body'])

        latCoord = body["latitude"]
        longCoord = body["longitude"]
        distance = body["maxDistance"]

        args = [latCoord, longCoord, distance]
        resultTuple = pymysql_CallProcAndGetArgs(cursor, 'FindItinerariesWithinDistanceOf', args)
        
        results = resultTuple[1]
       
        cursor.close()
        connection.close()
        
        return {
            "statusCode": 200,
            "body": results,
            "headers": {
                "Access-Control-Allow-Headers":"*",
                "Accept":"json"
        }}