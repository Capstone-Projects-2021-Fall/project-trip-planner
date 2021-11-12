import pymysql
import json
import dateutil.parser

from myutils import *

#configuration values
endpoint = 'tripplannerdb.cmmyrzbau9mp.us-west-2.rds.amazonaws.com'
username = 'admin'
password = 'TripPlanner'
database_name = 'database'

#connection
connection = pymysql.connect(endpoint, user=username, passwd=password, db=database_name)

def lambda_handler(event, context):
    cursor = connection.cursor()
    http_method = event["httpMethod"]
    
    if http_method == 'POST':
        body = json.loads(event['body'])
        username = body["username"]
        # or None here converts the empty string (aka "") to None. Cleaner from a database perspective. probably should be done in JS but whatever.
        firstName = body["firstName"] or None
        lastName = body['lastName'] or None
        temp = body['DOB'] or None
        #this is optional. idk how parse handles null or empty or whitespace, this simply short circuits it so it's null if any of those conditions arise.
        DOB = None if (not temp or not temp.strip()) else dateutil.parser.isoparse(temp)
        
        email = body["email"]
        password = body["password"]
        args = [username, firstName, lastName, DOB, email, password, 0, ""]
        
        resultTuple = pymysql_CallProcAndGetArgs(cursor, 'CreateUserNormalLogin', args)
        #this is an insert. we need to commit it
        connection.commit()
        #and fetchall should be null (technically the empty set, which the function makes null)
        newArgs = resultTuple[0]
        #results = resultTuple[1]
        #results == None -> True
        
        errorCode = newArgs[6]
        
        if (errorCode == 0):
            return {
                'statusCode': 200,
                'body': json.dumps('ok')
            }
        else:
            errorData = { "errorCode" : errorCode, "errorMessage" : newArgs[7] }
        
            return {
                'statusCode': 409,
                'body': errorData
            }