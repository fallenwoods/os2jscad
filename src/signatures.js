
var baseSignatures ={
    sphere:{names:['r','fa','fs','fn']},
    cube:{names:['size','center']},
    cylinder:{names:['h','r', 'r2','center','fa','fs','fn'],defaults:[1,1]},
    Polyhedron:{names:['points','faces','convexity']},
    projection:{names:['cut']},
    text:{names:['text','size','font','halign','valign','spacing','direction','language','script','fn']},

    circle:{names:['r','center','fa','fs','fn'],defaults:[1,true]},
    square:{names:['size','center']},
    polygon:{names:['points','paths','convexity']},
    import:{names:[]},

    linear_extrude:{names:['height','center','convexity','twist','slices','scale'],defaults:[1]},
    rotate_extrude:{names:['angle','convexity']},

    scale:{names:['v']},
    resize:{names:['newsize']},
    rotate:{names:['a','v']},
    translate:{names:['v']},
    mirror:{names:['v']},
    multmatrix:{names:['m']},
    color:{names:['c']},
    offset:{names:['r','chamfer']},

    minkowski:{names:[]},
    hull:{names:[]},
    union:{names:[]},
    difference:{names:[]},
    intersection:{names:[]},
    render:{names:['convexity']},

    //echo:{names:[]},
    surface:{names:['file','center','invert','convexity','text_file_format','images']},
    search:{names:['match_value','string_or_vector','num_returns_per_match','index_col_num']},
    version:{names:[]},
    version_num:{names:[]},
    parent_module:{names:['n']},
    assert:{names:[],defaults:['condition','message']},

    children:{names:['index']},
    child:{names:['x']},

}

module.exports = baseSignatures;