from org.drools.rule import Rule
import unittest, drools

class Record:
    def __init__(self, n=0):
        self.n = n
    def __str__(self):
        return 'Record[%s]'%self.n

class JythonRule:
    def __init__(self):
        self.parameters = (('r', Record),)
        def cond(r): return 1
        def cons(mem, r): r.n = 1
        self.condition = cond
        self.consequence = cons

class MockTuple:
    def __init__(self, d):
        self.d = d
    def get(self, d):
        return self.d
    def getWorkingMemory(self):
        return {}

class TestDrools(unittest.TestCase):
    def test_Record(self):
        r = Record()
        self.assertEquals(r.n, 0)
        self.assertEquals(str(r), 'Record[0]')
    def test_ObjectType(self):
        ot = drools.ObjectType(Record)
        self.failUnless(ot.matches(Record()))
        self.failIf(ot.matches(''))
    def test_Condition(self):
        rule = Rule('declarationFactory')
        decl = rule.addParameterDeclaration('r', drools.ObjectType(Record))
        cond = drools.Condition([decl], lambda r: r.n > 4)
        self.failUnless(cond.isAllowed(MockTuple(Record(5))))
        cond = drools.Condition([decl], lambda r: r.n > 4)
        self.failIf(cond.isAllowed(MockTuple(Record(4))))
    def test_Consequence(self):
        rule = Rule('declarationFactory')
        decl = rule.addParameterDeclaration('r', drools.ObjectType(Record))
        r = Record()
        def fn(mem, r):
            r.n = 5
        cons = drools.Consequence([decl], fn)
        cons.invoke(MockTuple(r))
        self.assertEquals(r.n, 5)
    def test_rule(self):
        r = Record()
        rule = drools._rule(JythonRule())
        self.failUnless(isinstance(rule, Rule))
        self.assertEquals(rule.getConditionSize(), 1)
        cons = rule.getConsequence()
        cons.invoke(MockTuple(r))
        self.assertEquals(r.n, 1)
    def test_newWorkingMemory(self):
        r = Record()
        mem = drools.newWorkingMemory('TestDrools', (JythonRule(),))
        mem.assertObject(r)
        self.assertEquals(r.n, 0)
        mem.fireAllRules()
        self.assertEquals(r.n, 1)

if __name__ == '__main__':
    unittest.main()

# Copyright (c) 2005  Eric Dobbs  Some rights reserved.
#
# This work is licensed under the Creative Commons Attribution
# License. To view a copy of this license, visit
# http://creativecommons.org/licenses/by/2.0/ or send a letter to
# Creative Commons, 559 Nathan Abbott Way, Stanford, California 94305,
# USA.
