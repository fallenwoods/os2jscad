function star2D(r1,r2,cnt) = [for(i=[0:cnt-1]) for(r=[r1,r2])  [sin(((r==r1?i:i+.5)*360/cnt))*r,cos(((r==r1?i:i+.5)*360/cnt))*r] ];
    
//function star2D(r1,r2,cnt) = [for(i=[0:cnt-1]) for(r=[r1,r2])  [i,r] ];
    
echo(star2D(1,4,5));
linear_extrude(5) polygon(star2D(1,4,5));