import pymysql
import json
from dateutil import parser

#configuration values
endpoint = 'tripplannerdb.cmmyrzbau9mp.us-west-2.rds.amazonaws.com'
username = 'admin'
password = 'TripPlanner'
database_name = 'database'

#connection
connection = pymysql.connect(endpoint, user=username, passwd=password, db=database_name)

def lambda_handler(event, context):
    cursor = connection.cursor()
    http_method = event["requestContext"]["http"]["method"]
    #http_method = event["httpMethod"]
    if http_method == 'POST':
        body = json.loads(event['body'])
        username = body["username"]
        firstName = body["firstName"]
        lastName = body['lastName']
        DOB = parser.parse(body['DOB']).date().isoformat()
        email = body["email"]
        password = body["password"]
        args = [username, firstName, lastName, DOB, email, password, 0, ""]
        cursor.callproc('CreateUserNormalLogin', args)
        connection.commit()
        return {
                'statusCode': 200,
                'body': json.dumps(args)
        }
    """elif http_method == 'GET':
        email:str = "bobbyhill@gmail.com"
        password:str = "ilikepropane"
        args = [email, password, None, 0, ""]
        cursor.callproc('TryGetLoginID', args)
        connection.close()
        userJson = { }
        userJson["UserID"] = args[2]
        userJson["ErrorCode"] = args[3]
        userJson["ErrorMessage"] = args[4]
        #no idea if this is how it works plz fix if not
        return {
            "statusCode": 200,
            "body": json.dumps(userJson, default=str),
            "headers": {
                "Access-Control-Allow-Headers":"*",
                "Accept":"json"
        }"""