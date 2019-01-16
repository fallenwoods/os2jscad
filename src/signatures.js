
var baseSignatures ={
    func_sphere:{names:['r','fa','fs','fn']},
    func_cube:{names:['size','center']},
    func_cylinder:{names:['h','r', 'r2','center','fa','fs','fn'],defaults:[1,1]},
    func_Polyhedron:{names:['points','faces','convexity']},
    func_projection:{names:['cut']},
    func_text:{names:['text','size','font','halign','valign','spacing','direction','language','script','fn']},


    func_circle:{names:['r','center','fa','fs','fn'],defaults:[1,true]},
    func_square:{names:['size','center']},
    func_polygon:{names:['points','paths','convexity']},
    func_import:{names:[]},

    func_linear_extrude:{names:['height','center','convexity','twist','slices','scale'],defaults:[1]},
    func_rotate_extrude:{names:['angle','convexity']},

    func_scale:{names:['v']},
    func_resize:{names:['newsize']},
    func_rotate:{names:['a','v']},
    func_translate:{names:['v']},
    func_mirror:{names:['v']},
    func_multmatrix:{names:['m']},
    func_color:{names:['c']},
    func_offset:{names:['r','chamfer']},

    func_minkowski:{names:[]},
    func_hull:{names:[]},
    func_union:{names:[]},
    func_difference:{names:[]},
    func_intersection:{names:[]},
    func_render:{names:['convexity']},

    //echo:{names:[]},
    func_surface:{names:['file','center','invert','convexity','text_file_format','images']},
    func_search:{names:['match_value','string_or_vector','num_returns_per_match','index_col_num']},
    func_version:{names:[]},
    func_version_num:{names:[]},
    func_parent_module:{names:['n']},
    func_assert:{names:[],defaults:['condition','message']},

    func_children:{names:['index']},
    func_child:{names:['x']},

    //Math built-ins
    func_abs:{names:[]},
    func_ceil:{names:[]},
    func_exp:{names:[]},
    func_floor:{names:[]},
    func_log:{names:[]},
    func_log10:{names:[]},
    func_max:{names:[]},
    func_min:{names:[]},
    func_norm:{names:[]},
    func_pow:{names:[]},
    func_round:{names:[]},
    func_sign:{names:[]},
    func_sqrt:{names:[]},
    func_sin:{names:[]},
    func_cos:{names:[]},
    func_tan:{names:[]},
    func_asin:{names:[]},
    func_acos:{names:[]},
    func_atan:{names:[]},
    func_atan2:{names:[]},

}

module.exports = baseSignatures;