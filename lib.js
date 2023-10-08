const m_vecVelocity = [0.0, 0.0, 0.0];
var tickCount = 1;
var timesCalled = 0;

function StartCalculations() 
{ 
    var subtickTarget = document.getElementById("subtick_val").value;
    if(subtickTarget == "" || (subtickTarget < 0 || subtickTarget > 1)) 
    {
        document.getElementById("error").innerHTML = "Please provide a number between 0.0 and 1.0"; 
        return;
    }
    document.getElementById("error").innerHTML = ""; 

    DoSubtickCalculations();
    DoNormalCalculations();
} 

function DoSubtickCalculations()
{
    var subtickTarget = document.getElementById("subtick_val").value;
    var subtick_interval = ((1 - subtickTarget) / 64);
    
    RunFrame(subtick_interval, false);
    tickCount = "2 (1/2)";
    RunFrame((1.0/64) - subtick_interval, false);
    tickCount = "2 (2/2)";
    RunFrame(subtick_interval, false);
    tickCount = 3;

    while(m_vecVelocity[1] < 250.0)
	{
		RunFrame((1.0/64), false);
        tickCount++;
	}
}

function DoNormalCalculations()
{
    tickCount = 1;
    m_vecVelocity[0] = 0.0;
    m_vecVelocity[1] = 0.0;
    m_vecVelocity[2] = 0.0;
    timesCalled = 0;

    while(m_vecVelocity[1] < 250.0)
	{
		RunFrame((1.0/64), true);
        tickCount++;
	}
}

function CreateRow(text, text2)
{
    var tablerow = document.createElement("tr");
    var tabledata = document.createElement("td");
    var tabledata2 = document.createElement("td");


    tabledata.innerHTML = text;
    tabledata2.innerHTML = text2;

    tablerow.appendChild(tabledata);
    tablerow.appendChild(tabledata2);
    return tablerow;
}

function RunFrame(frametime, normal)
{
    if(timesCalled >=2 || normal)
        Friction(frametime);
    
    WalkMove(frametime);

    timesCalled++;

    var dataSec = normal ? "nosubtick_data" : "CS2data";

    var dataSection = document.getElementById(dataSec);
    var data = CreateRow("" + tickCount, "" + m_vecVelocity[1]);
    dataSection.appendChild(data);

    console.log("tick: %s, velocity: %f", tickCount, m_vecVelocity[1]);
}

function Friction(frametime)
{
    var speed, newspeed, control;
	var friction = 5.2;
	var drop = 0;

	var sv_stopspeed = 80.0;

	speed = VectorLength(m_vecVelocity);
	control = (speed < sv_stopspeed) ? sv_stopspeed : speed;
	drop += control * friction * frametime;
	newspeed = speed - drop;

	if (newspeed < 0)
		newspeed = 0;

	if ( newspeed != speed )
	{
		newspeed /= speed;
		VectorScale(m_vecVelocity, newspeed, m_vecVelocity);
	}
}

function WalkMove(frametime)
{
    const wishvel = [0.0, 0.0, 0.0];
    var spd;
    var fmove, smove;
    const wishdir = [0.0, 0.0, 0.0];
    var wishspeed;

    fmove = 0;
    smove = 450.0;

    // Determine x and y parts of velocity
    wishvel[0] = 0;
    wishvel[1] = 1 * smove;
    wishvel[2] = 0;

    
    VectorCopy (wishvel, wishdir);   // Determine maginitude of speed of move
    wishspeed = VectorNormalize(wishdir);


    //
    // Clamp to server defined max speed
    //
    if ((wishspeed != 0.0) && (wishspeed > 250.0))
    {
        VectorScale (wishvel, 250.0/wishspeed, wishvel);
        wishspeed = 250.0;
    }

    Accelerate(wishdir, wishspeed, 5.5, frametime);
}


function Accelerate(wishdir, wishspeed, accel, frametime)
{
	var addspeed, accelspeed, currentspeed;

	// See if we are changing direction a bit
	currentspeed = Dot(m_vecVelocity, wishdir);

	// Reduce wishspeed by the amount of veer.
	addspeed = wishspeed - currentspeed;

	// If not going to add any speed, done.
	if (addspeed <= 0)
		return;

	var kAccelerationScale = Math.max(250.0, wishspeed);

	// Determine amount of acceleration.
	accelspeed = accel * frametime * kAccelerationScale;

	// Cap at addspeed
	if (accelspeed > addspeed)
		accelspeed = addspeed;

	m_vecVelocity[0] += accelspeed * wishdir[0];	
	m_vecVelocity[1] += accelspeed * wishdir[1];	
	m_vecVelocity[2] += accelspeed * wishdir[2];	
}

function VectorNormalize (vec)
{
	var radius = Math.sqrt(vec[0]*vec[0] + vec[1]*vec[1] + vec[2]*vec[2]);

	// FLT_EPSILON is added to the radius to eliminate the possibility of divide by zero.
	var iradius = 1.0 / ( radius + Number.EPSILON );
	
	vec[0] *= iradius;
	vec[1] *= iradius;
	vec[2] *= iradius;
		
	return radius;
}

function VectorCopy(src, dst)
{
	dst[0] = src[0];
	dst[1] = src[1];
	dst[2]= src[2];
}

function VectorLength(v)
{
    return Math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2]);
}

function VectorScale(a, b, c)
{
	c[0] = a[0] * b;
	c[1] = a[1] * b;
	c[2] = a[2] * b;
}

function Dot(a, b)
{
    return a[0]*b[0] + a[1]*b[1] + a[2]*b[2];
}