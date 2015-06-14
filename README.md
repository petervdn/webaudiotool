# Web Audio Tool

Web Audio Tool (www.webaudiotool.com) is a visual editor for the development of applications that make use of the Web Audio API. It helps with the graph creation/modification part of the Web Audio API, where you setup and connect the nodes that you need for your application. Doing this by code can be quite confusing when you end up with a huge amount of code that doesn't give any overview at all about the network that you're building. That's where the editor comes in: you can cleary see what you are creating and what's connected with what.

Apart from that, I will release the core engine as a standalone Javascript library to make it easier to talk to the graph you created, since there are some things about the API that can make life difficult there. The library will allow you to:
* get information about the current nodes and connections
* easily remove single nodes or connections from the graph
* inject (or remove) large subgraphs into the current one by a single command

# tl;dr
Web Audio Tool wants to make the creation of the audio network easy, after that you will still talk to the Web Audio API in the same way that you do now.
