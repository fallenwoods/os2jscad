a=[for(b=[1:10]) if(b%2) let (c=b*2) let(d=c+1) for(i=[d:d*2]) if(i<20) let (j=i) [d,j] ];

//a=[for(x=[2:5]) for(y=[1:3])  for(z=[5:6]) [x,y,z] ];
//a1=[for(x=[2:5]) for(y=[1:3])  [for(z=[5:6]) [x,y,z]] ];


//echo(a);
//if(a%3) sphere(4);

/*
//s = [ for (a = l) for (b = a) b ] ;

s = [ for (a = l)  for (b = a) b ] ;

c=[for(d=[1,2]) d ];
//*/