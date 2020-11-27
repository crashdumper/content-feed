# content-feed
Your personal customizable content feed

# Prerequisites
- .NET 5 - could be found [here](https://dotnet.microsoft.com/download/dotnet/5.0)

# How to build and run
1. Download source code
2. Open command line and go to `.\content-feed\ClientApp\`
3. Run `npm install`
4. Go to the parent folder (`cd ..`)
5. Run `dotnet build content-feed.csproj` and wait for the build to finish
6. Run `dotnet run content-feed.csproj`
7. Open the [local feed](https://localhost:5001/)

Note: if there is an issue with certificates please run `dotnet dev-certs https --trust` and click 'Yes' in the popup.