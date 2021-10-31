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

    if http_method == 'POST':
        body = json.loads(event['body'])
        username = body["username"]
        email = body["email"]
        password = body["password"]
        args = [username, email, password, True]
        cursor.callproc('CreateUserNormalLogin', args)
        connection.commit()
        return {
                'statusCode': 200,
                'body': json.dumps(args)
        }  
