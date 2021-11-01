import pymysql
import json
#configuration values
endpoint = 'tripplannerdb.cmmyrzbau9mp.us-west-2.rds.amazonaws.com'
username = 'admin'
password = 'TripPlanner'
database_name = 'database'


def lambda_handler(event, context):
    http_method = event["requestContext"]["http"]["method"]
    #http_method = event["httpMethod"]
    if http_method == 'GET':
        #connection
        connection = pymysql.connect(endpoint, user=username, passwd=password, db=database_name)
        cursor = connection.cursor()
        queryString = event["queryStringParameters"]["page"]
        args = [queryString, 0, ""] 
        #i don't think this will ever actually error, but whatever -Jett
        newArgs = cursor.callproc('RetrieveActivitiesForGivenItinerary', args)
        #we don't really have anywhere to send them anyway. 

        results = cursor.fetchall()
        itineraryJson = { }
        for count, index in enumerate(results):
            temp = {}
            temp["ActivityName"] = index[1]
            temp["Latitude"] = index[2]
            temp["Longitude"] = index[3]
            temp["Address"] = index[4]
            temp["StartTime"] = index[5]
            temp["EndTime"] = index[6]
            temp["AdditionalInformation"] = index[7]
            itineraryJson[count] = temp
        cursor.close()
        connection.close()
        return {
            "statusCode": 200,
            "body": json.dumps(itineraryJson, default=str),
            "headers": {
                "Access-Control-Allow-Headers":"*",
                "Accept":"json"
        }
        }
    elif http_method == 'POST':
        #connection
        connection = pymysql.connect(endpoint, user=username, passwd=password, db=database_name)
        cursor = connection.cursor()

        body = json.loads(event['body'])
        title = body['name']
        startDate = body['startDate']
        endDate = body['endDate']
        userID = body['userID']

        args = [title, startDate, endDate, userID]

        cursor.callproc('CreateItinerary', args)
        connection.commit()
        connection.close()
        cursor.close()
        return {
                'statusCode': 200,
                'body': json.dumps(args)
        }  

       