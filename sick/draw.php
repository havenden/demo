<?php
// $in=file_get_contents('php://input');
// this is just test data below
$e=[
    'errcode'=> 0,
    'errmsg'=>"OK",
    'cost'=>0,
    'data'=> [
        'origin_name'=> "base64.jpg",
        'ext'=>"jpg",
        'type'=>"image/jpeg",
        'url'=>"box/".date('YmdHis').".jpg"
        ]
];
echo json_encode($e);