import pymysql
import json
#configuration values
endpoint = 'tripplannerdb.cmmyrzbau9mp.us-west-2.rds.amazonaws.com'
username = 'admin'
password = 'TripPlanner'
database_name = 'database'


#connection
connection = pymysql.connect(endpoint, user=username, passwd=password, db=database_name)

def lambda_handler(event, context):
    http_method = event["requestContext"]["http"]["method"]

    if http_method == 'POST':
        connection = pymysql.connect(endpoint, user=username, passwd=password, db=database_name)
        cursor = connection.cursor()
        
        
        body = json.loads(event['body'])
        userID = body["userID"]
        itineraryName = body["itineraryName"]
        
        args = [userID, itineraryName, 0, ""]
        cursor.callproc('RetrieveUsersSingleItinerary', args)
    
        results = cursor.fetchall()[0][0]
        cursor.close()
        connection.close()
        return {
            "statusCode": 200,
            "body": json.dumps(results, default=str),
            "headers": {
                "Access-Control-Allow-Headers":"*",
                "Accept":"json"
            }
        }

