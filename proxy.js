var Sdk = /** @class */ (function () {
    function Sdk() {
    }
    return Sdk;
}());
// So we'll have initial types. These types will be a bunch of "any". This will be on CI, so CI does not fail.
// In development, when they run the API server locally, 
// Maybe frontend devs can run "yarn sdk generate --url=http://localhost:8810".
// This will call the API, and fetch all the types, and write those types to the types file for this package.
// The sdk on the backend will have the option of automatically syncing the frontend after a file change.
// @tensei/sdk -> client side package
// @tensei/sdk-generator 
var tensei = new Proxy({}, {
    get: function (target, method) {
        if (target[method] === undefined) {
            return function () {
                return {
                    findMany: function () {
                        console.log('#++++ findMany', method);
                    },
                    insertMany: function () {
                        console.log('#+++++ insertMany', method);
                    }
                };
            };
        }
    }
});
// @ts-ignore
tensei.posts().insertMany();
