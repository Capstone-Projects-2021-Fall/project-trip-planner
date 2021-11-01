import json
import mysql.connector
# import jwt

from http import cookies

endpoint = 'tripplannerdb.cmmyrzbau9mp.us-west-2.rds.amazonaws.com'
username = 'admin'
password = 'TripPlanner'
database_name = 'database'

def lambda_handler(event, context):
    http_method = event["requestContext"]["http"]["method"]
    #http_method = event["httpMethod"]
    
    if http_method == 'POST':
        connection = mysql.connector.connect(host=endpoint, user=username, passwd=password, db=database_name)
        cursor = connection.cursor()

        body = json.loads(event['body'])

        screen = body["search"]

        args = [screen]
        cursor.callproc('FindUsersWithNameLike', args)
        results = [r.fetchall() for r in cursor.stored_results()]
       
        cursor.close()
        connection.close()
        
        # usersJson = { }
        # for count, index in enumerate(results):
        #     temp = {}
        #     temp["UserID"] = index[0]
        #     temp["ScreenName"] = index[1]
        #     temp["FirstName"] = index[2]
        #     temp["LastName"] = index[3]
        #     usersJson[count] = temp
        
        return {
            "statusCode": 200,
            #"body": json.dumps(usersJson, default=str),
            "body": json.dumps(results, default=str),
            "headers": {
                "Access-Control-Allow-Headers":"*",
                "Accept":"json"
        }}