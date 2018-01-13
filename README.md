# Mindsweep
Inputs:
number of Bombs (Originally I was thinking this wouldn't go in the MVP.  But it would nice to have some input, even before I deal with the grid.  So maybe initially I'll accept the input and then output a message where the grid goes saying how many bombs there are.)
Size (MxN, both input)

Outcomes:
Win or Loss, messages will be output so that the user knows

Variables:
Size, so both width and length
Number of bombs

Permanent Data:
User's wins and losses (This would not be in the MVP.  It would be cool to have to do something with a database though, so having this feature would accomplish that.  I guess username would become one of the variables then, along with their wins and losses so that you can increment one at the end.)

Datatypes:
Length and Width would have to be integers (not part of MVP, but maybe some way to verify that they're integers in a certain range)
Number of bombs would also be an integer

Events:
There would be a "Start" button to let you start the game.  I don't think the listener for this would ever really need to turn off, since you could restart any time in theory.
Any clicking on the grid itself would also need to be an event.  I don't think any button pressing events will be necessary.
