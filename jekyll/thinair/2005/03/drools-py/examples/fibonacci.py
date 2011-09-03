# a drools example without the XML yuckiness
# http://drools.codehaus.org/State+Example

import drools

class Fibonacci:
    def __init__(self, sequence):
        self.sequence = sequence
        self.value = -1L
    def __str__(self):
        return 'Fibonacci(%s/%s)'%(self.sequence, self.value)

class Recurse:
    def __init__(self):
        self.salience = 10
        self.parameters = (('f', Fibonacci),)
        def condition(f):
            return f.value == -1L
        def consequence(workingMemory, f):
            print 'recurse for %s' % f.sequence
            workingMemory.assertObject(Fibonacci(f.sequence - 1))
        self.condition = condition
        self.consequence = consequence

class Bootstrap1:
    def __init__(self):
        self.parameters = (('f', Fibonacci),)
        def condition_a(f):
            return f.sequence == 2
        def condition_b(f):
            return f.value == -1L
        def consequence(workingMemory, f):
            f.value = 1L
            print '%s == %s' %(f.sequence, f.value)
            workingMemory.modifyObject(workingMemory.getFactHandle(f), f)
        self.condition_a = condition_a
        self.condition_b = condition_b
        self.consequence = consequence

class Bootstrap2:
    def __init__(self):
        self.salience = 20
        self.parameters = (('f', Fibonacci),)
        def condition_a(f):
            return f.sequence == 1
        def condition_b(f):
            return f.value == -1L
        def consequence(workingMemory, f):
            f.value = 1L
            print '%s == %s' %(f.sequence, f.value)
            workingMemory.modifyObject(workingMemory.getFactHandle(f), f)
        self.condition_a = condition_a
        self.condition_b = condition_b
        self.consequence = consequence

class Calculate:
    def __init__(self):
        self.parameters = (('f1', Fibonacci), ('f2', Fibonacci), ('f3', Fibonacci),)
        def condition_a(f1, f2, f3):
            return f2.sequence == f1.sequence + 1
        def condition_b(f1, f2, f3):
            return f3.sequence == f2.sequence + 1
        def condition_c(f1, f2, f3):
            return f1.value != -1L
        def condition_d(f1, f2, f3):
            return f2.value != -1L
        def condition_e(f1, f2, f3):
            return f3.value == -1L
        def consequence(workingMemory, f1, f2, f3):
            f3.value = f1.value + f2.value
            print '%s == %s' %(f3.sequence, f3.value)
            workingMemory.modifyObject(workingMemory.getFactHandle(f3), f3)
            workingMemory.retractObject(workingMemory.getFactHandle(f1))
        self.condition_a = condition_a
        self.condition_b = condition_b
        self.condition_c = condition_c
        self.condition_d = condition_d
        self.condition_e = condition_e
        self.consequence = consequence
            
if __name__ == '__main__':
    workingMemory = drools.newWorkingMemory('Fibonacci', (Recurse(), Bootstrap1(),
                                                     Bootstrap2(), Calculate()))
    workingMemory.assertObject(Fibonacci(50))
    workingMemory.fireAllRules()

# Copyright (c) 2005  Eric Dobbs  Some rights reserved.
#
# This work is licensed under the Creative Commons Attribution
# License. To view a copy of this license, visit
# http://creativecommons.org/licenses/by/2.0/ or send a letter to
# Creative Commons, 559 Nathan Abbott Way, Stanford, California 94305,
# USA.
