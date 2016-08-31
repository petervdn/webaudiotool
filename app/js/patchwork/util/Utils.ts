export function connectionIsInList(connection, connectionList, ignoreDestination:boolean = false):boolean
{
	for(var i = 0; i < connectionList.length; i ++)
	{
		if(!ignoreDestination)
		{
			if(
				connection.sourceModule          === connectionList[i].sourceModule &&
				connection.sourceOutputIndex     === connectionList[i].sourceOutputIndex &&
				connection.destinationModule     === connectionList[i].destinationModule &&
				connection.destinationInputIndex === connectionList[i].destinationInputIndex
			)
			{
				return true;
			}
		}
		else
		{
			if(
				connection.sourceModule      === connectionList[i].sourceModule &&
				connection.sourceOutputIndex === connectionList[i].sourceOutputIndex
			)
			{
				return true;
			}
		}

	}

	return false;
}

export function logConnections(label, connections, indent):void
{
	if(!indent) indent = '';
	console.log(indent + label);
	for(var i = 0; i < connections.length; i++) console.log(indent + i + ' - ' + connections[i].toString());
}
