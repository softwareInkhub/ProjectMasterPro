import { 
  DynamoDBClient, 
  ListTablesCommand, 
  CreateTableCommand,
  AttributeDefinition,
  KeySchemaElement,
  GlobalSecondaryIndex
} from "@aws-sdk/client-dynamodb";

// Define the tables that will be created in DynamoDB
export const TABLES = {
  COMPANIES: "Companies",
  USERS: "Users",
  DEPARTMENTS: "Departments",
  TEAMS: "Teams",
  PROJECTS: "Projects",
  EPICS: "Epics",
  STORIES: "Stories",
  TASKS: "Tasks",
  COMMENTS: "Comments",
  ATTACHMENTS: "Attachments",
  SPRINTS: "Sprints",
  BACKLOG_ITEMS: "BacklogItems",
  TIMEENTRIES: "TimeEntries",
  LOCATIONS: "Locations",
  DEVICES: "Devices",
  NOTIFICATIONS: "Notifications",
  GROUPS: "Groups"
};

// Interface for table configuration
export interface TableConfig {
  tableName: string;
  primaryKey: string;
  keyType: "S" | "N" | "B"; // String, Number, Binary
  indexes?: {
    name: string;
    key: string;
    keyType: "S" | "N" | "B";
  }[];
}

// Define table schemas
export const TABLE_SCHEMAS: TableConfig[] = [
  {
    tableName: TABLES.COMPANIES,
    primaryKey: "id",
    keyType: "S",
  },
  {
    tableName: TABLES.USERS,
    primaryKey: "id",
    keyType: "S",
    indexes: [
      {
        name: "EmailIndex",
        key: "email",
        keyType: "S"
      }
    ]
  },
  {
    tableName: TABLES.DEPARTMENTS,
    primaryKey: "id",
    keyType: "S",
    indexes: [
      {
        name: "CompanyIndex",
        key: "companyId",
        keyType: "S"
      }
    ]
  },
  {
    tableName: TABLES.TEAMS,
    primaryKey: "id",
    keyType: "S",
    indexes: [
      {
        name: "CompanyIndex",
        key: "companyId",
        keyType: "S"
      }
    ]
  },
  {
    tableName: TABLES.PROJECTS,
    primaryKey: "id",
    keyType: "S",
    indexes: [
      {
        name: "CompanyIndex",
        key: "companyId",
        keyType: "S"
      },
      {
        name: "TeamIndex",
        key: "teamId",
        keyType: "S"
      }
    ]
  },
  {
    tableName: TABLES.EPICS,
    primaryKey: "id",
    keyType: "S",
    indexes: [
      {
        name: "ProjectIndex",
        key: "projectId",
        keyType: "S"
      }
    ]
  },
  {
    tableName: TABLES.STORIES,
    primaryKey: "id",
    keyType: "S",
    indexes: [
      {
        name: "EpicIndex",
        key: "epicId",
        keyType: "S"
      }
    ]
  },
  {
    tableName: TABLES.TASKS,
    primaryKey: "id",
    keyType: "S",
    indexes: [
      {
        name: "StoryIndex",
        key: "storyId",
        keyType: "S"
      },
      {
        name: "AssigneeIndex",
        key: "assigneeId",
        keyType: "S"
      },
      {
        name: "ParentTaskIndex",
        key: "parentTaskId",
        keyType: "S"
      }
    ]
  },
  {
    tableName: TABLES.COMMENTS,
    primaryKey: "id",
    keyType: "S",
    indexes: [
      {
        name: "EntityTypeAndIdIndex",
        key: "entityType",
        keyType: "S"
      }
    ]
  },
  {
    tableName: TABLES.ATTACHMENTS,
    primaryKey: "id",
    keyType: "S",
    indexes: [
      {
        name: "EntityTypeAndIdIndex",
        key: "entityType",
        keyType: "S"
      }
    ]
  },
  {
    tableName: TABLES.SPRINTS,
    primaryKey: "id",
    keyType: "S",
    indexes: [
      {
        name: "ProjectIndex",
        key: "projectId",
        keyType: "S"
      },
      {
        name: "TeamIndex",
        key: "teamId",
        keyType: "S"
      },
      {
        name: "StatusIndex",
        key: "status",
        keyType: "S"
      }
    ]
  },
  {
    tableName: TABLES.BACKLOG_ITEMS,
    primaryKey: "id",
    keyType: "S",
    indexes: [
      {
        name: "ProjectIndex",
        key: "projectId",
        keyType: "S"
      },
      {
        name: "EpicIndex",
        key: "epicId",
        keyType: "S"
      },
      {
        name: "SprintIndex",
        key: "sprintId",
        keyType: "S"
      },
      {
        name: "StatusIndex",
        key: "status",
        keyType: "S"
      }
    ]
  },
  {
    tableName: TABLES.TIMEENTRIES,
    primaryKey: "id",
    keyType: "S",
    indexes: [
      {
        name: "TaskIndex",
        key: "taskId",
        keyType: "S"
      },
      {
        name: "UserIndex",
        key: "userId",
        keyType: "S"
      }
    ]
  },
  {
    tableName: TABLES.LOCATIONS,
    primaryKey: "id",
    keyType: "S",
    indexes: [
      {
        name: "CompanyIndex",
        key: "companyId",
        keyType: "S"
      }
    ]
  },
  {
    tableName: TABLES.DEVICES,
    primaryKey: "id",
    keyType: "S",
    indexes: [
      {
        name: "CompanyIndex",
        key: "companyId",
        keyType: "S"
      },
      {
        name: "DepartmentIndex",
        key: "departmentId",
        keyType: "S"
      },
      {
        name: "LocationIndex",
        key: "locationId",
        keyType: "S"
      },
      {
        name: "AssignedToIndex",
        key: "assignedToId",
        keyType: "S"
      },
      {
        name: "StatusIndex",
        key: "status",
        keyType: "S"
      },
      {
        name: "SerialNumberIndex",
        key: "serialNumber",
        keyType: "S"
      }
    ]
  },
  {
    tableName: TABLES.NOTIFICATIONS,
    primaryKey: "id",
    keyType: "S",
    indexes: [
      {
        name: "UserIndex",
        key: "userId",
        keyType: "S"
      }
    ]
  },
  {
    tableName: TABLES.GROUPS,
    primaryKey: "id",
    keyType: "S",
    indexes: [
      {
        name: "CompanyIndex",
        key: "companyId",
        keyType: "S"
      }
    ]
  }
];

// Function to convert TableConfig to DynamoDB CreateTableCommand parameters
export function createTableParams(tableConfig: TableConfig) {
  // Define primary key attributes and schema
  const attributeDefinitions: AttributeDefinition[] = [
    {
      AttributeName: tableConfig.primaryKey,
      AttributeType: tableConfig.keyType
    }
  ];
  
  const keySchema: KeySchemaElement[] = [
    {
      AttributeName: tableConfig.primaryKey,
      KeyType: "HASH" // Partition key
    }
  ];
  
  // Add secondary indexes if specified
  const globalSecondaryIndexes: GlobalSecondaryIndex[] = [];
  
  if (tableConfig.indexes && tableConfig.indexes.length > 0) {
    tableConfig.indexes.forEach(index => {
      // Add attribute definition for index
      attributeDefinitions.push({
        AttributeName: index.key,
        AttributeType: index.keyType
      });
      
      // Create the GSI configuration
      globalSecondaryIndexes.push({
        IndexName: index.name,
        KeySchema: [
          {
            AttributeName: index.key,
            KeyType: "HASH"
          }
        ],
        Projection: {
          ProjectionType: "ALL" // Project all attributes
        },
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
        }
      });
    });
  }
  
  // Return full table parameters
  return {
    TableName: tableConfig.tableName,
    AttributeDefinitions: attributeDefinitions,
    KeySchema: keySchema,
    BillingMode: "PAY_PER_REQUEST", // On-demand capacity
    GlobalSecondaryIndexes: globalSecondaryIndexes.length > 0 ? globalSecondaryIndexes : undefined
  };
}

// Initialize DynamoDB client for operations
export function getDynamoDBClient() {
  return new DynamoDBClient({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
    }
  });
}

// Function to create all tables if they don't exist
export async function createAllTables() {
  const client = getDynamoDBClient();
  
  try {
    // First check what tables already exist
    const existingTables = await client.send(new ListTablesCommand({}));
    const tableNames = existingTables.TableNames || [];
    
    console.log('Existing tables:', tableNames);
    
    // Create each table if it doesn't exist
    for (const tableConfig of TABLE_SCHEMAS) {
      if (!tableNames.includes(tableConfig.tableName)) {
        console.log(`Creating table: ${tableConfig.tableName}`);
        
        const params = createTableParams(tableConfig);
        
        try {
          await client.send(new CreateTableCommand(params));
          console.log(`Table ${tableConfig.tableName} created successfully.`);
        } catch (err) {
          console.error(`Error creating table ${tableConfig.tableName}:`, err);
        }
      } else {
        console.log(`Table ${tableConfig.tableName} already exists.`);
      }
    }
    
    console.log('DynamoDB setup complete!');
    return true;
  } catch (err) {
    console.error('Error setting up DynamoDB tables:', err);
    return false;
  }
}