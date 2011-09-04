from demo import PlotData
import unittest
from StringIO import StringIO
import Numeric
import itertools

class TestPlotData(unittest.TestCase):
    def assertClose(self, result, expect, message='failed'):
	self.failUnless(Numeric.allclose(result, expect),
	    '%s: expected: %s, actual: %s'%(message, str(expect), str(result)))
    def setUp(self):
	self.o = PlotData(StringIO(
"""
1.5 1.5e-4 -3.0
2.5 1.5e-4 -2.5
3.5 1.5e-4 -2.0
1.5 2.0e-4 -1.5
2.5 2.0e-4 -1.0
3.5 2.0e-4 -0.5
1.5 2.5e-4 0.0
2.5 2.5e-4 0.5
3.5 2.5e-4 1.0
1.5 1.5e-4 1.5
2.5 1.5e-4 2.0
3.5 1.5e-4 2.5
1.5 2.0e-4 3.0
2.5 2.0e-4 3.5
3.5 2.0e-4 4.0
1.5 2.5e-4 4.5
2.5 2.5e-4 5.0
3.5 2.5e-4 5.5
1.5 1.5e-4 6.0
2.5 1.5e-4 6.5
3.5 1.5e-4 7.0
1.5 2.0e-4 7.5
2.5 2.0e-4 8.0
3.5 2.0e-4 8.5
1.5 2.5e-4 9.0
"""))
    def test_ctor(self):
	self.assertRaises(AttributeError, PlotData, StringIO("0 0 0\n1 1 1"))
	self.assertEqual(self.o.data.shape, (5, 5), 'incorrect shape for data')
	i = 0;
	for expect in [[-3.0, -2.5, -2.0, -1.5, -1.0],
		       [-0.5,  0.0,  0.5,  1.0,  1.5],
		       [ 2.0,  2.5,  3.0,  3.5,  4.0],
		       [ 4.5,  5.0,  5.5,  6.0,  6.5],
		       [ 7.0,  7.5,  8.0,  8.5,  9.0]]:
	    self.failUnless(
		Numeric.allclose(self.o.data[i], expect),
		'incorrect values in row %d'%i)
	    i+=1
    def test_xSlice(self):
	self.o.xpos(3)
	self.assertClose(self.o.xSlice(), [-1.5, 1.0, 3.5, 6.0, 8.5],
			 'xSlice(3)')
    def test_resolution1_size2(self):
	self.o.resolution(1)
	self.o.size(2)
	self.assertClose(self.o.frame(), [[-3., -2.5], [-.5, 0.0]],
			 'res:1, size:2, x:0, y:0')
	self.o.xpos(3)
	self.assertClose(self.o.frame(), [[4.5, 5.0], [7.0, 7.5]],
			 'res:1, size:2, x:3, y:0')
	self.o.xpos(2)
	self.o.ypos(2)
	self.assertClose(self.o.frame(), [[3.0, 3.5], [5.5, 6.0]],
			 'res:1, size:2, x:2, y:2')
    def test_resolution2_size2(self):
	self.o.resolution(2)
	self.o.size(2)
	self.assertClose(self.o.frame(), [[-3., -2.], [2., 3.]],
			 'res:2, size:2, x:0, y:0')
	self.o.xpos(1)
	self.assertClose(self.o.frame(), [[2., 3.], [7., 8.]],
			 'res:2, size:2, x:1, y:0')
    def test_xyRange(self):
	o = PlotData(itertools.repeat('1.1 1.2 1.3', 10000))
	o.size(25)
	self.assertEqual(o.xRange(), (0, 75), 'xRange()')
	o.size(10)
	self.assertEqual(o.yRange(), (0, 90), 'yRange()')

if __name__ == '__main__':
    unittest.main()
