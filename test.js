var i = "{\n  \"reqType\": 0,\n  \"perception\": {\n    \"inputText\": {\n      \"text\": \"<%-params[1]%>\"\n    },\n    \"selfInfo\": {\n      \"location\": {\n        \"city\": \"成都\",\n        \"province\": \"四川\",\n        \"street\": \"天府软件园\"\n      }\n    }\n  },\n  \"userInfo\": {\n    \"apiKey\": \"5ea3a2cf0e1d40f291fbbf48b4200415\",\n    \"userId\": \"<%-message.sender.id%>\"\n  }\n}";

console.log(JSON.parse(i).perception.selfInfo.location);