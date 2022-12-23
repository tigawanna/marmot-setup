migrate((db) => {
  const collection = new Collection({
    "id": "t0rxrgcnbx2c0rn",
    "created": "2022-12-23 03:05:58.581Z",
    "updated": "2022-12-23 03:05:58.581Z",
    "name": "posts",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "hc65lffw",
        "name": "title",
        "type": "text",
        "required": true,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "pattern": ""
        }
      },
      {
        "system": false,
        "id": "dthl6wfw",
        "name": "body",
        "type": "text",
        "required": true,
        "unique": false,
        "options": {
          "min": null,
          "max": null,
          "pattern": ""
        }
      }
    ],
    "listRule": null,
    "viewRule": null,
    "createRule": null,
    "updateRule": null,
    "deleteRule": null,
    "options": {}
  });

  return Dao(db).saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("t0rxrgcnbx2c0rn");

  return dao.deleteCollection(collection);
})
