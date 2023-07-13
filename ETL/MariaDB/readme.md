This details the inital ETL proccess for MariaDb

I primarily took the approch of attempting to load in the file and seeing if there was any errors I feel safe in this approch because I have set sufficent restraints for the collums of each table in the database

The one major constraint I had to turn off was for checking foringe keys
later the connections will be verifyed via SQL query and any issues addressed

The query used for loading data was
```LOAD DATA INFILE 'path/to/file.csv'
INTO TABLE table_name
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS;```

All fields in my tables had to be in the same order as the csv data I reordered the fields that were not using this query:
```ALTER TABLE table_name
CHANGE COLUMN column_name
column_name COLUMN_DEFINITION_HERE
AFTER other_column_name;```


For styles.csv importing to the Styles table I ran into an issue where the value in the csv was null mariaDb expects null to be NULL this was fixed by adding this line to the import query
`WHERE null AS NULL`


There was lines in photos.csv that were not properly closed with double quotes

I used Kate and a regex find and replace to solve this
`("[^"\n]*)\r?\n(?!(([^"]*"){2})*[^"]*$)`

I also ran into an issue in the data where photos did not have valid we links I uppdated the entrys in the table with this query :

UPDATE Photos
SET url = REPLACE(url,'uhttp', 'http')

Since I had disable foring key checking when importing I then had to verify foringe keys manualy by query:

`SELECT COUNT(*) AS invalid_connections FROM Related WHERE relatedID NOT IN (   SELECT id FROM Products );`

Related had 58 invalid connections so I checked what they were :
```SELECT Related.*
    -> FROM Related
    -> LEFT JOIN Products ON Related.relatedID = Products.id
    -> WHERE Products.id IS NULL;
```


backed up the database then used delet querys to remove the invalid rows

```DELETE FROM Related
    -> WHERE relatedID NOT IN (
    -> SELECT id
    -> FROM Products
    -> );
```

Some products have 0 for price querys were used to check if they also did not have a default price
if they did not they were deleted as no price existed
if they did have a default price querys were used to alter orginal_price to match



after the data was cleaned I decided that It would be more performant to hold the Features and Photos tables as JSON(LongText alias) columns in Products the ratinal for this is
1. They will be written to all at once
2. Changes will be rare so the overall performance hit for writing will be negligable
3. They will be read all at once, there is no endpoint for a specific id
4. Features is neatly reperesented as key value and Photos as an object or array of objects

I used querys like this to move data from a table into products:
```UPDATE Products
SET features = (
    SELECT JSON_OBJECTAGG(feature, value)
    FROM Features
    WHERE Features.productID = Products.id
)
WHERE id IN (
    SELECT productID
    FROM Features
);```

