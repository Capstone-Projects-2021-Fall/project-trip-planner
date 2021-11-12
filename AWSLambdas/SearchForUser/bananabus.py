import json
import pymysql

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
        
        #should change screen name
        screen = body["query"]

        args = [screen]
        pair = pymysql_CallProcAndGetArgs(cursor, 'FindUsersWithNameLike', args)
        
        #no out args here so pair[0] is useless.
        results = pair[1]
        #not an insert or update so commit isn't needed (it actually will error)
        
        cursor.close()
        connection.close()
        
        return {
            "statusCode": 200,
            "body": results,
            "headers": {
                "Access-Control-Allow-Headers":"*",
                "Accept":"json"
        }}
        