#!/usr/bin/pythonw

from qt import QApplication, QObject, QVBox, QHBox, QSlider, QLCDNumber, QSizePolicy, PYSIGNAL, SIGNAL, SLOT
from pyqscimpl import Txq2dPlotWin, Txq3dPlotWin
from Numeric import array, reshape, arrayrange
from itertools import ifilter, imap, repeat
from math import sqrt, floor

class Plot2D(Txq2dPlotWin):
    def __init__(self, window, data):
	Txq2dPlotWin.__init__(self, window)
	self.data = data
	self.x = arrayrange(float(data.xmax))
	self.setAxes(data.xmin,data.zmin, data.xmax,data.zmax)
    def slice(self, i):
	self.setSeries(self.x, self.data.data[:,i])

class Plot3D(Txq3dPlotWin):
    def __init__(self, window, mesh):
	Txq3dPlotWin.__init__(self, window)
	self.setAxes(mesh.xmin, mesh.ymin, mesh.zmin,
		     mesh.xmax, mesh.ymax, mesh.zmax)
	self.mesh = mesh
	QObject.connect(self.mesh, PYSIGNAL('dataChanged()'),
			self.meshChanged)
	self.meshChanged()
    def meshChanged(self):
	self.setMesh(self.mesh.frame())
    def sizePolicy(self):
	return QSizePolicy(QSizePolicy.Expanding, QSizePolicy.Expanding)
	
class PlotData(QObject):
    def __init__(self, iter):
	QObject.__init__(self)
	limits = []
	d = _all(_ithird_column(
		_isave_limits(_isplit(_inon_empty_lines(iter)), limits)))
	droot = int(sqrt(len(d)))
	if len(d) != droot*droot:
	    raise AttributeError('data must be square')
	self.xmin, self.xmax = 0, droot
	self.ymin, self.ymax = 0, droot
	self.zmin, self.zmax = limits[2].min, limits[2].max
	self.data = reshape(array(d), (droot, droot))
	self.x = 0
	self.y = 0
	self.s = 30
	self.r = 1
    def frame(self):
	x, y, x1, y1 = map(lambda n: n * self.r,
	    (self.x, self.y, self.x + self.s, self.y + self.s))
	return self.data[x:x1:self.r, y:y1:self.r]
    def xSlice(self):
	return self.data[:, self.x]
    def xpos(self, x):
	self.x = x
	self.dataChanged()
    def ypos(self, y):
	self.y = y
	self.dataChanged()
    def size(self, s):
	self.s = s
	self.dataChanged()
	self.sizeChanged()
    def resolution(self, r):
	self.r = r
	self.dataChanged()
	self.resolutionChanged()
    def sizeRange(self):
	return (2, floor(self.xmax / self.r))
    def xRange(self):
	return (0, self.xmax - self.s)
    def yRange(self):
	return (0, self.ymax - self.s)
    def resolutionRange(self):
	return (1, min(150, floor(self.xmax / self.s)))
    def dataChanged(self):
	self.emit(PYSIGNAL('dataChanged()'), ())
    def sizeChanged(self):
	self.emit(PYSIGNAL('sizeChanged()'), ())
    def resolutionChanged(self):
	self.emit(PYSIGNAL('resolutionChanged(int, int)'),
		  self.resolutionRange())

class LCDRange(QVBox):
    def __init__(self, *args):
	QVBox.__init__(self, *args)
	self.slider = QSlider(QSlider.Horizontal, self, 'slider')
	self.slider.setRange(0, 999)
	self.slider.setValue(0)
	QObject.connect(self.slider, SIGNAL('valueChanged(int)'),
		self.valueChanged)
	self.setFocusProxy(self.slider)
    def value(self): return self.slider.value()
    def setValue(self, value): self.slider.setValue(value)
    def setRange(self, minValue, maxValue):
	if minValue < 0 or maxValue > 999 or minValue > maxValue:
	    print 'Error: setRange(%d, %d)'%(minValue, maxValue)
	    return
	self.slider.setRange(minValue, maxValue)
    #signal
    def valueChanged(self, value):
	self.emit(PYSIGNAL('valueChanged(int)'), (value,))
    def sizePolicy(self):
	return QSizePolicy(QSizePolicy.Maximum, QSizePolicy.Maximum)

#maybe going a bit overboard with the iterators to parse the data file :-)
def _inon_empty_lines(iter): return ifilter(len, _istrip(iter))
def _ithird_column(iter): return imap(lambda i: i[2], iter)
def _isplit(iter): return imap(lambda i: i.split(), iter)
def _istrip(iter): return imap(lambda i: i.strip(), iter)
def _all(iter): return [n for n in iter]
class save_min_max:
    def __init__(self): self.min, self.max = Max, Min
    def __call__(self, n):
	self.min, self.max = min(self.min, n), max(self.max, n)
	return n
def _isave_limits(iter, limits):
    if len(limits):
	raise AttributeError('limits must be an empty list')
    for n in iter:
	if not len(limits):
	    [limits.append(save_min_max()) for i in n]
	yield tuple([apply(fn, (float(i),)) for (fn, i) in zip(limits, n)])

class _ExtremeType(object):

    def __init__(self, cmpr, rep):
        object.__init__(self)
        self._cmpr = cmpr
        self._rep = rep

    def __cmp__(self, other):
        if isinstance(other, self.__class__) and\
           other._cmpr == self._cmpr:
            return 0
        return self._cmpr

    def __repr__(self):
        return self._rep

Max = _ExtremeType(1, "Max")
Min = _ExtremeType(-1, "Min")

class Demo(QHBox):
    def __init__(self, filename, *args):
	QHBox.__init__(self, *args)
	t = QVBox(self)
	self.plotdata = PlotData(file(filename))
	self.plot = Plot3D(self, self.plotdata)
	self.xmax = self.plotdata.xmax
	self.ymax = self.plotdata.ymax
	self.size = LCDRange(t, 'size')
	self.size.setRange(30, 125)
	self.size.setValue(125)
	self.xpos = LCDRange(t, 'xpos')
	self.xpos.setValue(725)
	self.ypos = LCDRange(t, 'ypos')
	self.ypos.setValue(400)
	self.plot2d()
	QObject.connect(self.size, PYSIGNAL('valueChanged(int)'),
			self.plotdata.size)
	QObject.connect(self.xpos, PYSIGNAL('valueChanged(int)'),
			self.plotdata.xpos)
	QObject.connect(self.ypos, PYSIGNAL('valueChanged(int)'),
			self.plotdata.ypos)
	QObject.connect(self.plotdata, PYSIGNAL('sizeChanged()'),
			self.sizeChanged)
	self.sizeChanged()
    def plot2d(self):
	self.box = QHBox()
	toolbar = QVBox(self.box)
	self.plot2d = Plot2D(self.box, self.plotdata)
	self.slider = QSlider(QSlider.Vertical, toolbar, 'slider')
	self.slider.setRange(0,self.plotdata.xmax - 1)
	self.slider.setValue(0)
	QObject.connect(self.slider, SIGNAL('valueChanged(int)'),
			self.plot2d.slice)
	self.plot2d.slice(0)
	self.box.show()
    def sizeChanged(self):
	apply(self.xpos.setRange, self.plotdata.xRange())
	apply(self.ypos.setRange, self.plotdata.yRange())

def main(argv):
    filename = argv.pop()
    app = QApplication(argv)
    demo = Demo(filename)
    app.setMainWidget(demo)
    demo.show()
    app.exec_loop()

if __name__ == '__main__':
    import sys
    main(sys.argv)
