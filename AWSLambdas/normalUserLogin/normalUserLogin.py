import json
import mysql.connector
from http import cookies

endpoint = 'tripplannerdb.cmmyrzbau9mp.us-west-2.rds.amazonaws.com'
username = 'admin'
password = 'TripPlanner'
database_name = 'database'


def lambda_handler(event, context):
    # = event["requestContext"]["http"]["method"]
    http_method = event["httpMethod"]
    
    if http_method == 'POST':
        connection = mysql.connector.connect(host=endpoint, user=username, passwd=password, db=database_name)
        cursor = connection.cursor()

        body = json.loads(event['body'])

        user = body["email"]
        passwd = body["password"]

        args = [user, passwd, -1, 0, ""]
        newArgs = cursor.callproc('TryLoginGetID', args)
        connection.close()
        userID = newArgs[2];

        if (userID is None):
            errorData = { "errorCode" : newArgs[3], "errorMessage" : newArgs[4] }
            errorData = { "errorCode" : "4", "errorMessage" : "testing" }
            return {
                "statusCode": 401,
                "body": json.dumps(errorData, default=str),
            }
        else:
            c = cookies.SimpleCookie()
            c["id"] = userID
            c["id"]["max-age"] = 7200
            #idk = c.js_output()
            return {
                "statusCode": 200,
                "body": json.dumps(c, default=str),
                "headers": {
                "Access-Control-Allow-Headers":"*",
                "Accept":"json"
                }
            }