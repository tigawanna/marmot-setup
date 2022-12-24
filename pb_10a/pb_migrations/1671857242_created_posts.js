migrate((db) => {
  const collection = new Collection({
    "id": "fse4dpkgjh7c1p4",
    "created": "2022-12-24 04:47:22.763Z",
    "updated": "2022-12-24 04:47:22.763Z",
    "name": "posts",
    "type": "base",
    "system": false,
    "schema": [
      {
        "system": false,
        "id": "r2lyogk0",
        "name": "title",
        "type": "text",
        "required": false,
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
  const collection = dao.findCollectionByNameOrId("fse4dpkgjh7c1p4");

  return dao.deleteCollection(collection);
})
