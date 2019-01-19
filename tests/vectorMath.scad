// This should be converted to use 'assert()'
module testAdd(){
    echo(" ");
    echo("Testing add");
    echo(str("1 + 2, = ",1 + 2," should be 3"));
    echo(str("1 + [2], = ",1 + [2]," should be undef"));
    echo(str("[1] + 2, = ",[1] + 2," should be undef"));
    echo(str("[1] + [2], = ",[1] + [2]," should be [3]"));
    echo(str("[1] + [2,3], = ",[1] + [2,3]," should be [3]"));
    echo(str("[1,2] + [3], = ",[1,2] + [3]," should be [4]"));
    echo(str("[1,2] + [3,4], = ",[1,2] + [3,4]," should be [4,6]"));
    echo(str("[1,2,3] + [4,5], = ",[1,2,3] + [4,5]," should be [5,7]"));
    echo(str("[1,2] + [3,4,5], = ",[1,2] + [3,4,5]," should be [4,6]"));
    echo(str("[1,2,3] + [4,5,6], = ",[1,2,3] + [4,5,6]," should be [5,7,9]"));
    echo(str("[[1,2]] + [[3,4]], = ",[[1,2]] + [[3,4]]," should be [[4,6]]"));
}

module testSub(){
    echo(" ");
    echo("Testing sub");
    echo(str("1 - 2, = ",1 - 2," should be -1"));
    echo(str("1 - [2], = ",1 - [2]," should be undef"));
    echo(str("[1] - 2, = ",[1] - 2," should be undef"));
    echo(str("[1] - [2], = ",[1] - [2]," should be [-1]"));
    echo(str("[1] - [2,3], = ",[1] - [2,3]," should be [-1]"));
    echo(str("[1,2] - [3], = ",[1,2] - [3]," should be [-2]"));
    echo(str("[1,2] - [3,4], = ",[1,2] - [3,4]," should be [-2,-2]"));
    echo(str("[1,2,3] - [4,5], = ",[1,2,3] - [4,5]," should be [-3,-3]"));
    echo(str("[1,2] - [3,4,5], = ",[1,2] - [3,4,5]," should be [-2,-2]"));
    echo(str("[1,2,3] - [4,5,6], = ",[1,2,3] - [4,5,6]," should be [-3,-3,-3]"));
    echo(str("[[1,2]] - [[3,4]], = ",[[1,2]] - [[3,4]]," should be [[-2,-2]]"));
}

module testMult(){
    echo(" ");
    echo("Testing mult");
    echo(str("1 * 2, = ",1 * 2," should be  2"));
    echo(str("1 * [2], = ",1 * [2]," should be  [2]"));
    echo(str("[1] * 2, = ",[1] * 2," should be  [2]"));
    echo(str("[1] * [2], = ",[1] * [2]," should be  2"));
    echo(str("[1] * [2,3], = ",[1] * [2,3]," should be  undef"));
    echo(str("[1,2] * [3], = ",[1,2] * [3]," should be  undef"));
    echo(str("[1,2] * [3,4], = ",[1,2] * [3,4]," should be  11"));
    echo(str("[1,2,3] * [4,5], = ",[1,2,3] * [4,5]," should be  undef"));
    echo(str("[1,2] * [3,4,5], = ",[1,2] * [3,4,5]," should be  undef"));
    echo(str("[1,2,3] * [4,5,6], = ",[1,2,3] * [4,5,6]," should be  32"));

    echo(" ");
    echo ("Any mult expression with a nested rhs uses the matrix logic");
    echo(str("[[1,2]] * [[3,4]], = ",[[1,2]] * [[3,4]]," should be  undef "));
    echo(str("[1,2] * [[3],[4]], = ",[1,2] * [[3],[4]]," should be [11]"));
    echo(str("[[1,2]] * [[3],[4]], = ",[[1,2]] * [[3],[4]]," should be [[11]] "));
    echo(str("[1,2,3,4] * [[5],[6],[7],[8]], = ",[1,2,3,4] * [[5],[6],[7],[8]]," should be  [70]"));
    echo(str("[[1,2],[3,4],[5,6]] * [[5,6],[7,8]], = ",[[1,2],[3,4],[5,6]] * [[5,6],[7,8]]," should be [[19, 22], [43, 50], [67, 78]] "));
    echo(str("[[1],[2]] * [[3],[4]], = ",[[1],[2]] * [[3],[4]]," should be  undef "));
    echo(str("[[1,2],[3,4],[5,6]] * [[5],[7,8]], = ",[[1,2],[3,4],[5,6]] * [[5],[7,8]]," should be [[19], [43], [67]] "));

    echo(" ");
    echo(str("v1=[1,2]; "));
    echo(str("v2=[1,2,3]; "));
    echo(str("m1=[[1,2,3],  [4,5,6]]; "));
    echo(str("m2=[[1,2], [3,4] ,[5,6]];    "));
    v1=[1,2];
    v2=[1,2,3];
    m1=[[1,2,3],  [4,5,6]];
    m2=[[1,2], [3,4] ,[5,6]];

    echo(str("v1*v1 = ",v1*v1," should be 5 "));
    echo(str("m1*m1 = ",m1*m1," should be undef "));
    echo(str("m1*m2 = ",m1*m2," should be [[22, 28], [49, 64]] "));
    echo(str("v1*m1 = ",v1*m1," should be [9, 12, 15] "));
    echo(str("m1*v1 = ",m1*v1," should be undef "));

    echo(str("v2*m1 = ",v2*m1," should be undef "));
    echo(str("m1*v2 = ",m1*v2," should be [14,32] "));
    echo(str("v2*v2 = ",v2*v2," should be 14 "));
}

module testDiv(){
    echo(" ");
    echo("Testing div");
    echo(str("1 / 2, = ",1 / 2," should be  0.5"));
    echo(str("1 / [2,3], = ",1 / [2,3]," should be  [0.5, 0.33333]"));
    echo(str("[1,2] / 3, = ",[1,2] / 3," should be  [0.33333, 0.6666667]"));
    echo(str("[1] / [2], = ",[1] / [2]," should be  undef"));
    echo(str("[1] / [2,3], = ",[1] / [2,3]," should be  undef"));
    echo(str("[1,2] / [3], = ",[1,2] / [3]," should be  undef"));
    echo(str("[1,2] / [3,4], = ",[1,2] / [3,4]," should be  undef"));
    echo(str("[1,2,3] / [4,5], = ",[1,2,3] / [4,5]," should be  undef"));
    echo(str("[1,2] / [3,4,5], = ",[1,2] / [3,4,5]," should be  undef"));
    echo(str("[1,2,3] / [4,5,6], = ",[1,2,3] / [4,5,6]," should be  undef"));
    echo(str("[[1,2]] / [[3,4]], = ",[[1,2]] / [[3,4]]," should be  undef"));
    echo(str("[[1,2]] / [[3],[4]], = ",[[1,2]] / [[3],[4]]," should be  undef"));
    echo(str("[[1,2]] / 3 , = ",[[1,2]] / 3 ," should be  [[0.33333, 0.6666667]]"));
}

testAdd();

testSub();

testMult();

testDiv();
