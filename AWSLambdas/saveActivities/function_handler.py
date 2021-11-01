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
        itineraryID = "10"#body["sourceItineraryID"]
        #upload events one at a time
        for activity in body["activities"]:
            #parse into datetime object
            dateTimeStart = parser.parse(activity['start'])
            dateTimeEnd = parser.parse(activity['end'])

            #collect necessary parameters to pass into stored procedure 
            title = activity['title']
            day = dateTimeStart.date().isoformat()
            startTime = dateTimeStart.time().isoformat()
            endTime = dateTimeEnd.time().isoformat()
                
            args = [itineraryID, title, day, startTime, endTime]
#           #currently set to compare similar activity titles to make sure there is no overlap. 
#           check = "SELECT ActivityName from database.PlannedActivity Where EXISTS(Select * FROM database.PlannedActivity where ActivityName = '" + title +"');"
#
#           cursor = connection.cursor()
#           cursor.execute(check)
#           results = cursor.fetchall()
#           row_count = cursor.rowcount
#           cursor.close()

#           if row_count ==0:
#               cursor = connection.cursor()
#               cursor.callproc('ActivityCreate', args)
#               connection.commit()
#               cursor.close()

            cursor = connection.cursor()
            cursor.callproc('ActivityCreate', args)
            connection.commit()
            cursor.close()

        connection.close()
        return {
                'statusCode': 200,
                'body': json.dumps("changes successfully saved")
        }  
