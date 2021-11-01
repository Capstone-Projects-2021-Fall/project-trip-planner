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
    #http_method = event["requestContext"]["http"]["method"]
    http_method = event["httpMethod"]
    if http_method == 'POST':
        body = json.loads(event['body'])
        username = body["username"]
        firstName = body["firstName"]
        lastName = body['lastName']
        DOB = parser.parse(body['DOB']).date().isoformat()
        email = body["email"]
        password = body["password"]
        args = [username, firstName, lastName, DOB, email, password, 0, ""]
        nArgs = cursor.callproc('CreateUserNormalLogin', args)
        #these aren't checked yet?
        errorCode = nArgs[6]
        errorMessage = nArgs[7]
        
        connection.commit()
        return {
                'statusCode': 200,
                'body': json.dumps(nArgs)
        }