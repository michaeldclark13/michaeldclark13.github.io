# Real Time Rendering (CSE 5542)- Lab 2
* Author: Michael Clark
* Instructor: Han-Wei Shen 
* Assigned: September 17, 2019
* Due: October 1, 2019 11:59 PM

## Drawing Program Instructions
* This program allows the user to draw simple 2D shapes via mouse clicks on the canvas within a browser window. The supported shapes are a point, horizontal line, vertical line, triangle, square, and circle. The supported colors are red, green, and blue. The drawing area can also be redrawn and cleared. After the shape is drawn, the shape can be rotated clockwise by keeping the mouse held down and dragging to the left. The shape can be rotated counterclockwise by draggin the mouse to the right. Additionally, once the shape is drawn and the mouse is released, the shape can be scaled up or down by pressing S/s respectively. Finally, once a shape or multiple shapes have been drawn, the global environment can be rotated by pressing W and then using the mouse dragging functionality to rotate all presently drawn shapes. To turn off this global rotation feature by pressing w.
* Changing Shapes
  * Key 'p' for drawing points
  * Key 'h' for drawing horizontal lines
  * Key 'v' for drawing vertical lines
  * Key 't' for drawing triangles
  * Key 'q' for drawing squares
  * Key 'o' for drawing circles
  * Key 'r' for drawing red shapes
* Changing Colors
  * Key 'r' for drawing red shapes
  * Key 'g' for drawing green shapes
  * Key 'b' for drawing blue shapes
* Key 'd' for redisplaying/redrawing the screen
* Key 'c' for clearing the screen
* Keep mouse held down and drag to the right for counterclockwise and to the left for clockwise
* Press S (Shift S) for scaling a shape up and s (lowercase) for scaling the shape down
* Global rotation: Press W (Shift W) and then use the previously mentioned mouse rotation feature. Press w (lowercase) to turn off this feature

## Bonus Tasks Attempted
* None

## Browsers/OS
* Safari was the primary browser that I tested in.
* I developed using MacOS

## Notes

* When drawing shapes near or on/beneath each other, points are drawn first, followed by horizontal lines, vertical lines, triangles, squares, and circles. In other words, if the user clicks to first draw a square, and then clicks to draw a  triangle in the same location, the triangle will appear behind the square. This is as a result of having one buffer for each type of shape in which the entire buffer for points is drawn first, followed by the buffers for each other shape.
