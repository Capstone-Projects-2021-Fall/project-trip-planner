import datetime
import json

#date and datetime are not recognized by json dumps.
#this is a fix for that.
#see: https://code-maven.com/serialize-datetime-object-as-json-in-python
def myconverter(o):
    if isinstance(o, datetime.datetime):
        return o.isoformat()
    elif isinstance(o, datetime.date):
        return str(o)
    else:
        return str(o)

#modified version of Stack Overflow example of SQL -> JSON. 
#See https://stackoverflow.com/questions/3286525/return-sql-table-as-json-in-python/3287775

#columnNameList is a list of string. the size is unknown.
#cursor is the MySQL Cursor.
    #cursor.MySQLCursor in mysql.connection
    #pymysql.cursors.Cursor in pymysql
#returns a valid JSON list of objects, or None if the list is empty. 
def convertToJSON(columnNameList, results):
    r = [dict(zip(columnNameList, row)) for row in results]
    
    return None if not r else json.dumps(r, default = myconverter)
    
#returns a tuple of two objects: the returned arguments from the stored proc call as a tuple, and the results as a list of JSON objects.
#we do the same thing each time, it just makes sense to abstract it out.
def pymysql_CallProcAndGetArgs(cursor, proc_name, args):
    cursor.callproc(proc_name, args)
    results = cursor.fetchall()
    
    jsonified = None
    
    if results:
        columnNameList = [my_object[0] for my_object in cursor.description]
        jsonified = convertToJSON(columnNameList, results) if results else None
    
    
    #new Args defaults to an empty tuple. if args is not empty, we can actually fill it.
    newArgs = tuple()
    
    argLen = len(args)
    if (argLen > 0):
        argPrefix = "@_" + proc_name + "_"
        query = "SELECT "+ argPrefix + "0"
        
        #there's probably a more python way of doing this. i don't know it, and this works fine.
        if (argLen > 1):
            for index in range(1,argLen):
                query += ", " + argPrefix + str(index)
        
        cursor.execute(query);
        newArgs = cursor.fetchall()[0]
    
    
    
    
    return (newArgs, jsonified)