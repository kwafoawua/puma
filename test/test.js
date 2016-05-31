/*global define, test, ok, equal */

/*
 *                  PUMASCRIPT MAIN TEST SUITE
 *  Check if the test include calls to PumaScript built-in function it
 *  must be added the require('pumascript') call.
 */

define(['pumascript', 'esprima'], function(puma, esprima) {

    test("number constant test", function() {
        var result = puma.evalPuma("1");
        ok( result.success && 1 === result.value, "Passed!" );
    });

    test("string constant test", function() {
        var result = puma.evalPuma("\"Hello\"");
        ok( result.success && "Hello" === result.value, "Passed!" );
    });

    test("test division", function(){
        var result = puma.evalPuma("2 / 2;");
        equal( result.value, 1, "Passed!");
    });

    test("test instanceof", function(){
        var result = puma.evalPuma("[1,2] instanceof Array;");
        equal( result.value, true, "Passed!");
    });

    test("arithmetic operations", function(){
        var result = puma.evalPuma("1 + 1 * 2 << 2 >> 2 / 2;");
        equal( result.value, 1 + 1 * 2 << 2 >> 2 / 2, "Passed!");
    });

    test("basic function", function(){
        var result = puma.evalPuma("function foo(){ return 1; } foo();");
        equal( result.value, 1, "Passed!");
    });

    test("basic function arguments", function(){
        var result = puma.evalPuma("function foo(a, b){ return a + b; } foo(1, 2);");
        equal( result.value, 3, "Passed!");
    });

    test("basic function arguments with same name than local variables", function(){
        var result = puma.evalPuma("var a = 2; var b = 3; function foo(a, b){ return a + b; } foo(1, 2);");
        equal( result.value, 3, "Passed!");
    });

    test("parent variable hidden by local variable", function(){
        var result = puma.evalPuma("var a = 1; function foo(){ var a = 5; return a; } foo();");
        result.makeValue();
        equal( result.value, 5, "Passed!");
    });

    test("local variable function do not alias parent scope function", function(){
        var result = puma.evalPuma("var a = 1; function foo(){ var a = 5; return a; } foo(); a;");
        result.makeValue();
        equal( result.value, 1, "Passed!");
    });

    test("parent variable accessed from local function", function(){
        var result = puma.evalPuma("var a = 1; function foo(){ a = 5; return 2; } foo(); a;");
        result.makeValue();
        equal( result.value, 5, "Passed!");
    });

    test("parent variable accessed from local function", function(){
        var result = puma.evalPuma("var a = 1; var b = 1; function foo(){ var a = 2; function foo2(){ a = 5; } foo2(); b = a; return 2; } foo(); b;");
        result.makeValue();
        equal( result.value, 5, "Passed!");
    });

    test("recursive function call", function(){
        var result = puma.evalPuma("function recursive(a){ if(a>5) return a; else return recursive(a+1); } recursive(1);");
        equal(result.value, 6, "Passed!");
    });

    test("function that returns a function", function(){
        var result = puma.evalPuma("function foo(){ function inner(){ return 2; } return inner; } foo()();");
        equal(result.value, 2, "Passed!");
    });

    test("return statement", function(){
        var result = puma.evalPuma("function foo(){ return 1; return 2; } foo();");
        equal( result.value, 1, "Passed!");
    });

    test("for empty", function(){
        var result = puma.evalPuma("for(;false;) {  }; true;");
        equal( result.value, true, "Passed!");
    });

    test("for statement 1", function(){
        var result = puma.evalPuma("for(var i=0;i<2;i=i+1) { j+=1; }");
        equal( result.value, 2, "Passed!");
    });

    test("for statement 2", function(){
        var result = puma.evalPuma("var b=true; for(var i=0;b;i=i+1) { if(i>5)b=false;}");
        equal( result.value, false, "Passed!");
    });

    test("for statement 3", function(){
        var result = puma.evalPuma("var b=true; for(var i=0;b;i=i+1) { if(i>5)b=false; j+=1;}");
        equal( result.value, 7, "Passed!");
    });

    test("for statement update test", function(){
        var result = puma.evalPuma("var first = true; var firstValue = -1; for(var i=5;i<7;i=i+1) { console.log(i); if(first){ firstValue = i; first = false; }  j+=1; } console.log(firstValue); firstValue;");
        result.makeValue();
        equal( result.value, 5, "Passed!");
    });

    test("simple array access", function(){
        var result = puma.evalPuma("var a1 = [1,2,3]; a1[1];");
        result.makeValue();
        equal( result.value, 2, "Passed!");
    });

    test("property access using expressions", function(){
        var result = puma.evalPuma("var a1 = [1,2,3,4]; var index = 2; a1[1+1];");
        result.makeValue();
        equal( result.value, 3, "Passed!");
    });

    test("Comments testing 1", function(){
        var result = puma.evalPuma("var b=true; //This is a comment");
        equal( result.success, true, "Passed!");
    });

    test("Comments testing 2", function(){
        var result = puma.evalPuma("//Comment\n var b=true;");
        equal( result.success, true, "Passed!");
    });

    test("Comments testing 3", function(){
        var result = puma.evalPuma("/*Comment*/ var b=true;");
        equal( result.success, true, "Passed!");
    });

    test("meta variables types counting", function(){
        var meta = puma.evalPuma("var a; a = 1; a = \"hola\"; a = 2;").value.meta;
        equal( meta.number, 2, "Passed!");
        equal( meta.string, 1, "Passed!");
    });

    test("meta parameters and return type counting", function(){
        var meta = puma.evalPuma("function foo(a, b){ return a + b; } foo(1,2); foo(3,4); foo;").value.value.meta;
        equal(meta.parameters[0].number, 2, "Passed!");
        equal(meta.parameters[1].number, 2, "Passed!");
        equal(meta.returns.number, 2, "Passed!");
    });

    test("mixed meta parameters and return type counting", function(){
        var meta = puma.evalPuma("function foo(a, b){ return a + b; } foo(1,\"hola\"); foo(3,4); foo;").value.value.meta;
        equal(meta.parameters[0].number, 2, "Passed!");
        equal(meta.parameters[1].number, 1, "Passed!");
        equal(meta.returns.number, 1, "Passed!");
        equal(meta.returns.string, 1, "Passed!");
    });


    test("Meta Function testing 1", function(){
        var result = puma.evalPuma("/*@meta*/ function funcion(){}; function foo() {}; funcion;");
        equal( result.success, true, "Passed!");
        equal( result.value._value.isMeta, true, "Passed!");
    });

    test("Meta Function testing 2", function(){
        var result = puma.evalPuma("/*@meta*/ function funcion(){}; function foo() {}; foo;");
        equal( result.success, true, "Passed!");
        equal( result.value._value.isMeta, false, "Passed!");
    });

    test("Meta Function in function expressions", function(){
        var result = puma.evalPuma("var f1 = /*@meta*/function(){}; f1;");
        equal( result.success, true, "Passed!");
        equal( result.value._value.isMeta, true, "Passed!");
    });

    test("Meta Function evalPumaAst intrinsic function", function(){
        var result = puma.evalPuma("var result; /*@meta*/function sum(a, b){result = evalPumaAst(a).value + evalPumaAst(b).value;return null;}sum(4,5);result;");
        equal( result.success, true, "Passed!");
        equal( result.value.value, 9, "Passed!");
    });

    test("Unary expressions", function(){
        var result = puma.evalPuma("var a = '3'; var b = 1; b++; if(!false){~(+a + (-b));}");
        equal( result.value, -2, "Passed!");
    });

    test("While statement 1", function(){
        var result = puma.evalPuma("var a=0; while(a<10){a++;}");
        equal( result.value, 10, "Passed!");
    });

    test("While statement 2", function(){
        var result = puma.evalPuma("var a=0; var b=true; while(b){if(a>=9){b=false;} a++;}");
        equal( result.value, 10, "Passed!");
    });

    test("Object expression", function(){
        var result = puma.evalPuma("var o1 = { a: 1, b: 3 }; o1;");
        equal( result.value.value.a, 1, "Passed!");
        equal( result.value.value.b, 3, "Passed!");
    });

    test("Object expression 2", function(){
        var result = puma.evalPuma("var o1 = { 'a': 1, 'b': 3 }; o1;");
        equal( result.value.value.a, 1, "Passed!");
        equal( result.value.value.b, 3, "Passed!");
    });

    test("Object expression with inner sub objects", function(){
        var result = puma.evalPuma("var o1 = { a: { c: 1 }, b: { d: 'hola'} }; o1;");
        equal( result.value.value.a.c, 1, "Passed!");
        equal( result.value.value.b.d, 'hola', "Passed!");
    });

    test("Basic Meta Function that rewrite itself", function(){
        var result = puma.evalPuma("/*@meta*/ function sumar(a,b){ return "+
        '{"type":"BinaryExpression","operator":"+","left": a,"right":b };' +
                                   " } sumar(5, 6);");
        result = puma.evalPumaAst(result.pumaAst);
        equal( result.success, true, "Passed!");
        equal( result.value, 11, "Passed!");
    });

    test("Basic Meta Function that returns null do not rewrite itself", function(){
        var result = puma.evalPuma("/*@meta*/ function sumar(a,b){ return null; } sumar(5, 6);");
        equal( result.success, true, "Passed!");
        equal( result.value, null, "Passed!");
        equal( result.pumaAst.body[0].expression.callee.name, 'sumar', "Passed!");
    });

    test("Call AST Construction Function", function(){
        var result = puma.evalPuma("pumaAst('hola');");
        equal( result.success, true, "Passed!");
        equal( result.value.value, 'hola', "Passed!");
    });

    test("Call AST Construction Function - trivial id replace", function(){
        var result = puma.evalPuma("var id = { type: 'Identifier', id:'bla' }; pumaAst($id);");
        equal( result.success, true, "Passed!");
        equal( result.value.id, 'bla', "Passed!");
    });

    test("rewrite forIn meta function test", function(){
        var result = puma.evalPuma("var puma = require('pumascript'); /* @meta */ function rewriteForIn(){var forIns=puma.pumaFindByType(pumaProgram,'ForInStatement');console.log('For In statements found: '+forIns.length);for(var index=0;index<forIns.length;index++)rewriteSingleForIn(forIns[index]);return null} function rewriteSingleForIn(forInAst){var left=forInAst.left;var right=forInAst.right;var itemName;var tempId;if(left.type==='Identifier')itemName=left;else if(left.type==='VariableDeclaration'){tempId=left.declarations[0].id;itemName=pumaAst($tempId)}else return;var cloneForIn=puma.pumaCloneAst(forInAst);var optimizedFor=puma.pumaCloneAst(forInAst);optimizedFor.type='ForStatement';optimizedFor.init=left;optimizedFor.test=pumaAst($itemName<$right.length);optimizedFor.update=pumaAst($itemName=$itemName+1);var temp = pumaAst(function(){if($right instanceof Array)$optimizedFor;else $cloneForIn});var tempIf=puma.pumaFindByType(temp,'IfStatement')[0];forInAst.type=tempIf.type;forInAst.test=tempIf.test;forInAst.consequent=tempIf.consequent;forInAst.alternate=tempIf.alternate}rewriteForIn();var array=[7,2,3,7];var i=0;for(i in array)array[i]+=1;for(var j in array)array[j]+=1;"
        );
        equal( result.success, true, "Passed!");
    });

    test("Basic Meta Function that rewrite itself using pumaAst", function(){
        var result = puma.evalPuma("/*@meta*/ function sumar(a,b){ return pumaAst(6 + 5); } sumar(5, 6);");
        result = puma.evalPumaAst(result.pumaAst);
        equal( result.success, true, "Passed!");
        equal( result.value, 11, "Passed!");
    });

    test("Basic Meta Function that rewrite itself using pumaAst and parameters", function(){
        var result = puma.evalPuma("/*@meta*/ function sumar(a,b){ return pumaAst( $a +  $b); } sumar(5, 6);");
        result = puma.evalPumaAst(result.pumaAst);
        equal( result.success, true, "Passed!");
        equal( result.value, 11, "Passed!");
    });

    test("Puma Find by Type", function(){
        var ast = esprima.parse("1 + 2; 5+4; a = 2;");
        var result = puma.pumaFindByType(ast, "BinaryExpression");

        equal( result.length, 2, "Passed!");
    });

    test("Puma Find by Properties", function(){
        var ast = esprima.parse("1 + 2; 5+4; a = 2;");
        var result = puma.pumaFindByProperty(ast, "expression.left.name", "a");

        equal( result.length, 1, "Passed!");
    });

    test("Puma Find by Properties with custom comparator", function(){
        var ast = esprima.parse("a = 2; b = 3; cc = 1;");
        var result = puma.pumaFindByProperty(ast, "left.name", 1, function (value1, value2) { 
            return value1.length === value2; 
        });

        equal( result.length, 2, "Passed!");
    });

    test("Member expression", function(){
        var result = puma.evalPuma("var o1 = { a: 1, b: 3 }; o1.b;");
        equal( result.value.value, 3, "Passed!");
    });

    test("Member expression with inner sub objects", function(){
        var result = puma.evalPuma("var o1 = { a: { c: 1 }, b: { d: 'hola'} }; o1.b.d;");
        equal( result.value.value, 'hola', "Passed!");
    });

    test("Basic Meta Function that rewrite itself using pumaAst and parameters 2", function(){
        var result = puma.evalPuma("/*@meta*/ function sumar(a,b){ var ast = pumaAst( $a +  $b); return ast; } sumar(5, 6);");
        result = puma.evalPumaAst(result.pumaAst);
        equal( result.success, true, "Passed!");
        equal( result.value, 11, "Passed!");
    });

    test("Function expression", function(){
        var result = puma.evalPuma("var a = function() { return 3; }; a();");
        equal( result.value, 3, "Passed!");
    });

    test("Function expression with parameters", function(){
        var result = puma.evalPuma("var a = function(number) { return number; }; a(4);");
        equal( result.value, 4, "Passed!");
    });

    test("Function expression recursive", function(){
        var result = puma.evalPuma("var a = function fact(number){ if(number > 1) { return number + fact(number - 1); } else { return number; } }; a(3);");
        equal( result.value, 6, "Passed!");
    });

    test("Array expression", function(){
        var result = puma.evalPuma("var a = [1, 2, ]");
        equal( result.value.value[1], 2, "Passed!");
        equal( result.value.value[2], null, "Passed!");
        equal( result.value.value.length, 2, "Passed!");
    });

    test("Meta function merge evaluation", function(){
        var result = puma.evalPuma("/*@meta*/ function parseInt (valueExp) {var ast = pumaAst($valueExp | 0);return ast;}var n1 = parseInt('97');n1 + 2;");
        equal( result.value, 99, "Passed!");
    });

    test("test logical operator &&", function(){
        var result = puma.evalPuma("true && true;");
        equal( result.value, true, "Passed!");
    });

    test("test logical operator && does not evaluate second arg", function(){
        var result = puma.evalPuma("var a1=1;false && a1++;a1;");
        equal( result.value.value, 1, "Passed!");
    });

    test("test logical operator ||", function(){
        var result = puma.evalPuma("false || true;");
        equal( result.value, true, "Passed!");
    });

    test("test logical operator || does not evaluate second arg", function(){
        var result = puma.evalPuma("var a1=1;true || a1++;a1;");
        equal( result.value.value, 1, "Passed!");
    });

    test("test call to native functions", function(){
        var result = puma.evalPuma("var regex = /^([0-9]+)?(\.[0-9]+)?$/; regex.test('1231233')");
        equal( result.value, true, "Passed!");
    });

    test("test call to native functions using objects as arguments", function(){
        var result = puma.evalPuma("var regex = /^([0-9]+)?(\.[0-9]+)?$/; var a1 = { value: '12.56' }; regex.test(a1.value)");
        equal( result.value, true, "Passed!");
    });

    test("test call to native functions in native objects", function(){
        var result = puma.evalPuma("Math.round(7.888);");
        equal( result.value, 8, "Passed!");
    });

    test("test for native string and property access", function(){
        var result = puma.evalPuma("'hola'.substr(1) === 'ola'");
        equal( result.value, true, "Passed!");
    });

    test("New Expression: simple object", function(){
        var result = puma.evalPuma("function A(){ this.a = 10; } var o = new A(); o.a;");
        equal( result.value.value, 10, "Passed!");
    });

    test("New Expression: constructor with parameters", function(){
        var result = puma.evalPuma("function A(a){ this.a = a; } var o = new A(5); o.a;");
        equal( result.value.value, 5, "Passed!");
    });

    test("New Expression: object with an extended prototype", function(){
        var result = puma.evalPuma("function A(){ this.a = 1; } A.prototype.b = 2; var o = new A(); o.b;");
        equal( result.value.value, 2, "Passed!");
    });


    /*
     This test is when the support for new expression added
     test("test for native string and property acess against object type", function(){
     var result = puma.evalPuma("'hola'.substr(1) === new String('ola')");
     equal( result.value, false, "Passed!");
     });
     */

    test("array property access using reference expression", function(){
        var result = puma.evalPuma("var a1 = [1,2,3,4]; var index = 1; a1[index];");
        result.makeValue();
        equal( result.value, 2, "Passed!");
    });

    test("object property access using member access and computed expression", function(){
        var result = puma.evalPuma("var a1 = { uno: 1, dos: 2 }; a1['uno'] + a1.dos + a1['un' + 'o'];");
        result.makeValue();
        equal( result.value, 4, "Passed!");
    });

    test("'check that pumaFindByProperty ends", function(){
        var result = puma.evalPuma("var puma = require('pumascript'); /* @meta */ function findInnerHTML(){ var final = puma.pumaFindByProperty(puma.pumaFindByType(pumaProgram, 'AssignmentExpression'), 'left.property.name', 'innerHTML'); final[0].right.name = 'pepe'; return null;} function test1(){ divVacio.innerHTML = textoHtml;} findInnerHTML(); true;");
        result.makeValue();
        equal( result.value, true, "Passed!");
    });

    test("test prune phase",function(){
        var result = puma.evalPuma("/*@meta*/ function parseInt (valueExp) {var ast = pumaAst($valueExp | 0);return ast;}var n1 = parseInt('97');n1 + 2;");
        var metaNodeCount = 0;
        for (var i = 0; i < result.pumaAst.body.length; i++) {
            if(result.pumaAst.body[i].isMeta){
                metaNodeCount++;
            }
        }
        equal(metaNodeCount,0,"Passed!");
    });
	
	// Tests de la seccion 12 de ECMA: Statements
		
	test("block statement 1", function(){
        var result = puma.evalPuma("1;;;;;");
        ok( result.success && 1 === result.value, "Passed!" );
    });
	
	test("block statement 2", function(){
        var result = puma.evalPuma("1;{}");
        result.makeValue();
        console.log(result);
        equal( result.value, 1, "Passed!");
    });
	
	test("block statement 3", function(){
        var result = puma.evalPuma("1;var a;");
        result.makeValue();
        equal( result.value, 1, "Passed!");
    });
	
	test("variable declaration: variables are initialised to undefined when created", function(){
        var result = puma.evalPuma("var a1;");
        result.makeValue();
        equal( result.value, undefined, "Passed!");
    });
	
	test("variable declaration: variables are assigned the value of their AssignmentExpression when the VariableStatement is executed.", function(){
        var result = puma.evalPuma("var a1 = 1;");
        result.makeValue();
        equal( result.value, 1, "Passed!");
    });
	
	// TODO testear The production VariableDeclaration : Identifier Initialiser is evaluated as follows:
	
	test("variable declaration in strict mode: 'eval' as identifier", function(){
    var exceptionMessage;
    try{
        var result = puma.evalPuma("'use strict';var eval;");
    } catch (e) {
        exceptionMessage = e.message;
    }
        //result.makeValue();
        equal( exceptionMessage, "Line 1: Variable name may not be eval or arguments in strict mode", "Passed!");
    });
	
	test("variable declaration in strict mode: 'arguments' as identifier", function(){
         var exceptionMessage;
    try{
        var result = puma.evalPuma("\"use strict\"; var arguments;");
    } catch (e) {
        exceptionMessage = e.message;
    }
        //result.makeValue();
        equal( exceptionMessage, "Line 1: Variable name may not be eval or arguments in strict mode", "Passed!");
    });
	
	test("empty statement", function(){
        var result = puma.evalPuma(";");
        result.makeValue();
        equal( result.value, null, "Passed!");
    });
	
	// TODO testear An ExpressionStatement cannot start with an opening curly brace because that might make it ambiguous with a
	// Block. Also, an ExpressionStatement cannot start with the function keyword because that might make it ambiguous with a
	// FunctionDeclaration.
	// (como hago para que JS o PumaScript se de cuenta que estoy queriendo escribir un ExpressionStatement y no un Block o FunctionDeclaration?)
	
	test("if statement: true", function(){
        var result = puma.evalPuma("if (true) 1; else 2;");
        result.makeValue();
        equal( result.value, 1, "Passed!");
    });
	
	test("if statement: false", function(){
        var result = puma.evalPuma("if (false) 1; else 2;");
        result.makeValue();
        equal( result.value, 2, "Passed!");
    });
	
	test("do Statement while (Expression)", function(){
        var result = puma.evalPuma("var a = 0;  do a++; while (a<10); a;");
        result.makeValue();
        equal( result.value, 10, "Passed!");
    });
	
	test("while (Expression) Statement", function(){
        var result = puma.evalPuma("var a = 0; \n while (a<10) \n a++; \n a === 10;");
        result.makeValue();
        equal( result.value, true, "Passed!");
    });
	
	test("for (ExpressionNoIn ; Expression ; Expression) (no Statement)", function(){
        var result = puma.evalPuma("for(var i = 0; i < 10 ; i++); \n i;");
        result.makeValue();
        equal( result.value, 10, "Passed!");
    });
	
	test("for (ExpressionNoIn ; Expression ; Expression) Statement", function(){
        var result = puma.evalPuma("for(var i = 0; i < 10 ; i++) \n i++; \n i;");
        result.makeValue();
        equal( result.value, 10, "Passed!");
    });
	
	test("for (ExpressionNoIn ; Expression ; ) Statement", function(){
        var result = puma.evalPuma("for(var i = 0; i < 10 ; ) i++; i;");
        //result.makeValue();
        equal( result.value, 10, "Passed!");
    });
	
	test("for (ExpressionNoIn ;  ; Expression) Statement", function(){
        var result = puma.evalPuma("for(var i = 0; ; i++) if (i === 10) break; i;");
        result.makeValue();
        equal( result.value, 10, "Passed!");
    });
	
	test("for ( ; Expression ; Expression) ", function(){
        var result = puma.evalPuma("var i = 0; \n for( ; i < 10 ; i++); \n i;");
        result.makeValue();
        equal( result.value, 10, "Passed!");
    });
	
	test("for ( LeftHandSideExpression in Expression ) Statement", function(){
        var result = puma.evalPuma("var person = {a:1, b:2, c:3}; var res = 0; var x; for (x in person) { res += person[x]; } res;");
        result.makeValue();
        equal( result.value, 6, "Passed!");
    });

	test("for ( var VariableDeclarationNoIn in Expression ) Statement", function(){
        var result = puma.evalPuma("var res = 0; var obj = {a:1, b:2, c:3}; for (var prop in obj) { res += obj[prop] } res;");
        result.makeValue();
        equal( result.value, 6, "Passed!");
    });
	
	test("continue ; (no Identifier)", function(){
        var result = puma.evalPuma("var res = 0; for(var i = 0; i < 5 ; i++) { if (i < 3) continue; res += i; } res;");
        result.makeValue();
        equal( result.value, 7, "Passed!");
    });
	
	test("continue ; (no Identifier)", function(){
        var result = puma.evalPuma("var res = 0; for(var i = 0; i < 5 ; i++) { if (i < 3) continue; res += i; } res;");
        result.makeValue();
        equal( result.value, 7, "Passed!");
    });
	
	test("BAD continue ; (no Identifier)", function(){
        var errorMessage;
        try {
            var result = puma.evalPuma("continue;");
        } catch (err) {
            errorMessage = err.message;
        }
        equal( errorMessage, "Line 1: Illegal continue statement", "Passed!");
    });
	
	test("continue [no LineTerminator here] Identifier;", function(){
        var result = puma.evalPuma("var res = 0; anIdentifier: for(var i = 0; i < 5 ; i++) { if (i < 3) continue anIdentifier; res += i; } res;");
        result.makeValue();
        equal( result.value, 7, "Passed!");
    });
	
	test("BAD continue [no LineTerminator here] Identifier;", function(){
        var errorMessage;
        try {
            var result = puma.evalPuma("var res = 0; for(var i = 0; i < 5 ; i++) { if (i < 3) continue anIdentifier; res += i; } res;");
        } catch (err) {
            errorMessage = err.message;
        }
        equal( errorMessage, "Line 1: Undefined label 'anIdentifier'", "Passed!");
    });
	
    test("Break ; (no Identifier)", function(){
        var result = puma.evalPuma("var res = 0; for(var i = 0; i < 5 ; i++) { if (i >= 3) break; res += i; } res;");
        result.makeValue();
        equal( result.value, 3, "Passed!");
    });
	
    test("BAD break ; (no Identifier)", function(){
        var errorMessage;
        try {
            var result = puma.evalPuma("break;");
        } catch (err) {
            errorMessage = err.message;
        }
        equal( errorMessage, "Line 1: Illegal break statement", "Passed!");
    });
    
    test("break [no LineTerminator here] Identifier;", function(){
        var result = puma.evalPuma("var res = 0; anIdentifier: for(var i = 0; i < 5 ; i++) { if (i >= 3) break anIdentifier; res += i; } res;");
        result.makeValue();
        equal( result.value, 3, "Passed!");
    });
	
	test("BAD break [no LineTerminator here] Identifier;", function(){
        var errorMessage;
        try {
            var result = puma.evalPuma("var res = 0; for(var i = 0; i < 5 ; i++) { if (i >= 3) break anIdentifier; res += i; } res;");
        } catch (err) {
            errorMessage = err.message;
        }
        equal( errorMessage, "Line 1: Undefined label 'anIdentifier'", "Passed!");
    });
	
    test("Return ; (no Expression)", function(){
        var result = puma.evalPuma("function a() { return; } a()");
        result.makeValue();
        equal( result.value, undefined, "Passed!");
    });
	
    test("BAD return ; (no Expression)", function(){
        var errorMessage;
        try {
            var result = puma.evalPuma("return;");
        } catch (err) {
            errorMessage = err.message;
        }
        equal( errorMessage, "Line 1: Illegal return statement", "Passed!");
    });
    
    test("return [no LineTerminator here] Expression;", function(){
        var result = puma.evalPuma("function a() { return 3; } a()");
        result.makeValue();
        equal( result.value, 3, "Passed!");
    });
	
	test("BAD return [no LineTerminator here] Expression;", function(){
        var errorMessage;
        try {
            var result = puma.evalPuma("return 3;");
        } catch (err) {
            errorMessage = err.message;
        }
        equal( errorMessage, "Line 1: Illegal return statement", "Passed!");
    });
    
    test("With (Expression) read property inside Expression", function(){
        var result = puma.evalPuma("var a = 5; var obj = { a : 10 }; with (obj) { a }");
        result.makeValue();
        equal( result.value, 10, "Passed!");
    });
    
    test("With (Expression) read property outside Expression", function(){
        var result = puma.evalPuma("var b = 5; var obj = { a : 10 }; with (obj) { b }");
        result.makeValue();
        equal( result.value, 5, "Passed!");
    });
    
    test("With (Expression) in strict mode", function(){
        var errorMessage;
        try {
            var result = puma.evalPuma("\"use strict\"; var obj = { a : 10 }; with (obj) { a }");
        } catch (err) {
            errorMessage = err.message;
        }
        equal( errorMessage, "Line 1: Strict mode code may not include a with statement", "Passed!");
    });
    
    test("Switch (Expression) no CaseBlock", function(){
        var result = puma.evalPuma("var a; switch (a) {}");
        result.makeValue();
        equal( result.value, undefined, "Passed!");
    });
    
    test("Switch (Expression) case with break", function(){
        var result = puma.evalPuma("var a = 1; switch (a) { case 1: 1; break; case 2: 2;}");
        result.makeValue();
        equal( result.value, 1, "Passed!");
    });
    
    test("Switch (Expression) case without break", function(){
        var result = puma.evalPuma("var a = 1; var b = 0; switch (a) { case 1: b += 1; case 2: b += 2;} b;");
        result.makeValue();
        equal( result.value, 3, "Passed!");
    });
    
    test("Switch (Expression) case default", function(){
        var result = puma.evalPuma("var a = 0; switch (a) { case 1: 1; break; default: 2;}");
        result.makeValue();
        equal( result.value, 2, "Passed!");
    });
    
    test("LabelledStatement : Identifier : Statement", function(){
        var result = puma.evalPuma("anIdentifier: for(var i = 0; i < 5 ; i++) { } i;");
        result.makeValue();
        equal( result.value, 5, "Passed!");
    });
	
	test("Nested labels with different identifiers", function(){
        var result = puma.evalPuma("anIdentifier: for(var i = 0; i < 5; i++) { anIdentifier2: for (var j = 0; j < 5; j++) {} } i + j;");
        result.makeValue();
        equal( result.value, 10, "Passed!");
    });
    
    test("Nested labels with the same identifiers", function(){
        var errorMessage;
        try {
            var result = puma.evalPuma("anIdentifier: for(var i = 0; i < 5; i++) { anIdentifier: for (var j = 0; j < 5; j++) {} } i + j;");
        } catch (err) {
            errorMessage = err.message;
        }
        equal( errorMessage, "Line 1: Label 'anIdentifier' has already been declared", "Passed!");
    });
    
    test("throw string", function(){
        var errorMessage;
        try {
            var result = puma.evalPuma("throw \"someString\"");
        } catch (err) {
            errorMessage = err.message;
        }
        equal( errorMessage, "someString", "Passed!");
    });
    
    test("throw number", function(){
        var errorMessage;
        try {
            var result = puma.evalPuma("throw 42");
        } catch (err) {
            errorMessage = err.message;
        }
        equal( errorMessage, 42, "Passed!");
    });
    
    test("throw true", function(){
        var errorMessage;
        try {
            var result = puma.evalPuma("throw true");
        } catch (err) {
            errorMessage = err.message;
        }
        equal( errorMessage, true, "Passed!");
    });
    
     /* VER COMO PROBAR ESTO EN LA CONSOLA
    test("try catch", function(){
        var result = puma.evalPuma("try { return; } catch (err) { m = err.message; } m;");
        result.makeValue();
        equal( result.value, "Line 1: Illegal return statement", "Passed!");
    });
    */
    
    // TODO testear debugger
    
});
