

export function logConnections(label, connections, indent):void
{
	if(!indent) indent = '';
	console.log(indent + label);
	for(var i = 0; i < connections.length; i++) console.log(indent + i + ' - ' + connections[i].toString());
}
