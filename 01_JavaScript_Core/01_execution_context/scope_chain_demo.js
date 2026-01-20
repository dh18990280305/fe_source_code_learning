
let a = 100

function foo(){
    let b = 200
    function bar(){
        let c = 300
        console.log('count: ', a + b + c)
    }
    bar()
}

foo()