//!OpenSCAD
// Ball bearing spool holder for the Replicator1
// Written by Joe Cabana  1/2/2013
// You are free to use and/or modify this software for non-comercial
// uses as long as you retain this message. Thanks.

// Spool dimensions
SpoolCnt = 18;  // Number of spool sizes
SpoolWid = [97, 93, 89, 85, 81, 77, 73, 69, 65, 61, 57, 53, 49, 45, 41, 37, 33, 29];  // Width of filament spool the first one must be the biggest, and the last one the smallest.
SpoolSpace = 1;  // Extra space on each side of the spool

// Bearing mount dimensions
SplShdDia = 30;  // Diameter of spool guiding shoulder
SplShdThk = 2;  // Thickness of spool guiding shoulder

// Bracket dimensions
InBrkThk = 12;  // Thickness of bracket on back of replicator
OutBrkThk = 8;  // Thickness of bracket on outside
BrkWid = 100; // Width of bracket on back of replicator
InBrkHgt = 150;  // Height of bracket on back or replicator
OutBrkHgt = 30;  // Height of outside bracket
SlotDepth = 3; // Depth of slots to hold outer bracket
SlotWidth = 2; // Width of slots to hold outer bracket
SlotClear = .2;  // Clearance for outer bracket slots
ArmWid = (2 * SplShdThk) + (2 * OutBrkThk) + InBrkThk + SpoolWid[0] + SpoolSpace + SlotWidth + 1;  // Width of outer bracket arms
ArmThk = 3;  // Thickness of outer bracket arms

    // Outer bracket mounting arms
    translate([-OutBrkHgt*1.5,-(ArmWid/2+InBrkThk),0])
        Arm(0);
    translate([OutBrkHgt/2+5,ArmWid/2-InBrkThk,ArmThk])
        rotate([180,0,0])
            Arm(1);


// Routine to draw the outer bracket mounting arm
module Arm(Invert = 0)
{
    SlotBlockWid = SpoolWid[0]-SpoolWid[SpoolCnt-1]+(3*SlotWidth) + 1.5;  // Width of block to hold slots

    difference()
    {
        // Arm
        union()
        {
            cube([OutBrkHgt,ArmWid,ArmThk]);  // Arm
            if (Invert)
                translate([0,ArmWid-SlotBlockWid-OutBrkThk-.5,-(SlotDepth-SlotClear)])
                    cube([OutBrkHgt,SlotBlockWid,ArmThk+SlotDepth-SlotClear]);  // Outer bracket support
            else
                translate([0,ArmWid-SlotBlockWid-OutBrkThk-.5,0])
                    cube([OutBrkHgt,SlotBlockWid,ArmThk+SlotDepth-SlotClear]);  // Outer bracket support
        }

        // Outer bracket slots
        for (cnt = [0 : (SpoolCnt-1)])
            if (Invert)
                translate([SlotWidth-SlotClear,(2*SplShdThk)+OutBrkThk+InBrkThk+SpoolWid[cnt]+SpoolSpace-(SlotWidth+(2*SlotClear)),-(ArmThk+1)])
                    cube([OutBrkHgt,SlotWidth+(2*SlotClear),SlotDepth+1]);  // Outer bracket support
            else
                translate([SlotWidth-SlotClear,(2*SplShdThk)+OutBrkThk+InBrkThk+SpoolWid[cnt]+SpoolSpace-(SlotWidth+(2*SlotClear)),ArmThk])
                    cube([OutBrkHgt,SlotWidth+(2*SlotClear),SlotDepth+1]);  // Outer bracket support
    }
}