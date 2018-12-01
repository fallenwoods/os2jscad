// Original had slices=500, but that choked jscad
linear_extrude(height=150, twist=120, $fn=200, scale=1.5, slices=50) square(75, center=true);
linear_extrude(height=150, twist=-240, $fn=200, scale=1.5, slices=50) square(75, center=true);
linear_extrude(height=150, twist=30, $fn=200, scale=1.5, slices=50) square(75, center=true);