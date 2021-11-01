import pymysql
import json
from dateutil import parser

#configuration values
endpoint = 'tripplannerdb.cmmyrzbau9mp.us-west-2.rds.amazonaws.com'
username = 'admin'
password = 'TripPlanner'
database_name = 'database'


def lambda_handler(event, context):
    http_method = event["requestContext"]["http"]["method"]
    #uncomment here if you want to test using aws
    #http_method = event["httpMethod"]

    if http_method == 'POST':
        #connection
        connection = pymysql.connect(endpoint, user=username, passwd=password, db=database_name)

        body = json.loads(event['body'])
        itineraryID = body["sourceItineraryID"]
        #upload events one at a time
        
        #Note: MySql has a JSON_TABLE command, i am looking into using it to eliminate this for loop - it is just one call to the database instead of multiple in a for loop. -Jett
        #For now, though, this is fine.
        
        for activity in body["activities"]:
            #parse into datetime object
            dateTimeStart = parser.parse(activity['start'])
            dateTimeEnd = parser.parse(activity['end'])
            
            #collect necessary parameters to pass into stored procedure 
            title = activity['title']
            latitude = activity['latitude']
            longitude = activity['longitude']
            address = activity['address']
            description = activity['additionalInformation']
            startTime = dateTimeStart.isoformat()
            endTime = dateTimeEnd.isoformat()
      
            args = [title, float(latitude), float(longitude), address, int(itineraryID), startTime, endTime, description, 0, ""]


            cursor = connection.cursor()
            cursor.callproc('CreateItineraryItemWithActivity', args)
            connection.commit()
            cursor.close()

        connection.close()
        return {
                'statusCode': 200,
                'body': json.dumps("changes successfully saved")
        }  
