module test_double_helix_gear (
	teeth=17,
	circles=8)
{
	//double helical gear
	{
		twist=200;
		height=20;
		pressure_angle=30;

		gear ();
		mirror([0,0,1])
		gear ();
	}
}

if(true)
{
	//double helical gear
    a=1;
	{
		twist=200;
		height=20;
		pressure_angle=30;

		gear ();
		mirror([0,0,1])
		gear ();
	}
}