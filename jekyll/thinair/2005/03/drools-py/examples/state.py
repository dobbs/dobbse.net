# a drools example without the XML yuckiness
# http://drools.codehaus.org/State+Example

import drools

NOTRUN = 'notrun'
FINISHED = 'finished'

class State:
    def __init__(self, name):
        self.name = name
        self.state = NOTRUN
    def instate(self, name, state):
        return self.name == name and self.state == state
    def __str__(self):
        return '%s [%s]' % self.name, self.state

class Bootstrap:
    def __init__(self):
        self.parameters = (('a', State),)
        def condition(a):
            return a.name == 'A' and a.state == NOTRUN
        def consequence(workingMemory, a):
            print a.name + ' finished'
            a.state = FINISHED
            workingMemory.modifyObject(workingMemory.getFactHandle(a), a)
        self.condition = condition
        self.consequence = consequence

class A2B:
    def __init__(self):
        self.salience = 30
        self.parameters = (('a', State), ('b', State))
        def condition_A(a, b):
            return a.name == 'A' and a.state == FINISHED
        def condition_B(a, b):
            return b.name == 'B' and b.state == NOTRUN
        def consequence(workingMemory, a, b):
            print b.name + ' finished'
            b.state = FINISHED
            workingMemory.modifyObject(workingMemory.getFactHandle(b), b)
        self.condition_A = condition_A
        self.condition_B = condition_B
        self.consequence = consequence
        
class B2C:
    def __init__(self):
        self.salience = 20
        self.parameters = (('b', State), ('c', State))
        def condition_B(b, c):
            return b.name == 'B' and b.state == FINISHED
        def condition_C(b, c):
            return c.name == 'C' and c.state == NOTRUN
        def consequence(workingMemory, b, c):
            print c.name + ' finished'
            c.state = FINISHED
            workingMemory.modifyObject(workingMemory.getFactHandle(c), c)
        self.condition_B = condition_B
        self.condition_C = condition_C
        self.consequence = consequence

class B2D:
    def __init__(self):
        self.salience = 10
        self.parameters = (('b', State), ('d', State))
        def condition_B(b, d):
            return b.name == 'B' and b.state == FINISHED
        def condition_D(b, d):
            return d.name == 'D' and d.state == NOTRUN
        def consequence(workingMemory, b, d):
            print d.name + ' finished'
            d.state = FINISHED
            workingMemory.modifyObject(workingMemory.getFactHandle(d), d)
        self.condition_B = condition_B
        self.condition_D = condition_D
        self.consequence = consequence

if __name__ == '__main__':
    workingMemory = drools.newWorkingMemory('State', (Bootstrap(), A2B(), B2C(), B2D()))
    for x in ([State(x) for x in 'A B C D'.split()]):
        workingMemory.assertObject(x)
    workingMemory.fireAllRules()

# Copyright (c) 2005  Eric Dobbs  Some rights reserved.
#
# This work is licensed under the Creative Commons Attribution
# License. To view a copy of this license, visit
# http://creativecommons.org/licenses/by/2.0/ or send a letter to
# Creative Commons, 559 Nathan Abbott Way, Stanford, California 94305,
# USA.
