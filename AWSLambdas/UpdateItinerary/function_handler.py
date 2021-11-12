import pymysql
import json
#configuration values
endpoint = 'tripplannerdb.cmmyrzbau9mp.us-west-2.rds.amazonaws.com'
username = 'admin'
password = 'TripPlanner'
database_name = 'database'

"""
Function is used to list all itineraries that the user has created. Used in the listSavedItineraries.html page
"""
def lambda_handler(event, context):
    http_method = event["requestContext"]["http"]["method"]
    #http_method = event["httpMethod"]
    if http_method == 'GET':
        #connect to database
        connection = pymysql.connect(endpoint, user=username, passwd=password, db=database_name)
        cursor = connection.cursor()

        #Call stored procedure with hard coded arguments and store to return to website
        #(CHANGE NUMBER 2 WHEN USER ACCOUNT FEATURE WORKS)        
        args = [2, 0, "test"]
        cursor.callproc('RetrieveAllItinerariesForUser', args)
        results = cursor.fetchall()

        #close database
        cursor.close()
        connection.close()
        
        #response
        return {
            "statusCode": 200,
            "body": json.dumps(results, default = str)
        }