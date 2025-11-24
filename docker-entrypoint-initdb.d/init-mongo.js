// MongoDB initialization script
// This script runs when the container starts for the first time

db = db.getSiblingDB('scihome');

// Create a user for the scihome database
db.createUser({
  user: 'root',
  pwd: '2!p$OcY^%OsoVB$*0F3x',
  roles: [
    {
      role: 'readWrite',
      db: 'scihome'
    },
    {
      role: 'dbAdmin',
      db: 'scihome'
    }
  ]
});

print('MongoDB initialization completed for scihome database');

