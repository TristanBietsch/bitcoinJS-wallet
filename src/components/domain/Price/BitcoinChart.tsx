/**
 * Bitcoin price chart component
 * Displays Bitcoin price history with interactive tooltip on touch/drag
 */
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, Animated as RNAnimated, Dimensions, PanResponder, GestureResponderEvent } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { BitcoinChartProps } from '@/src/types/price.types';
import { formatDate, formatCurrency } from '@/src/utils/formatting/price';
import { CHART_HEIGHT, SCREEN_WIDTH } from '@/src/config/price';
import { useToast, Toast, ToastTitle, ToastDescription } from '@/components/ui/toast';
import ErrorIcon from '@/components/ui/icons/ErrorIcon';

// Get the actual screen dimensions
const screenWidth = Dimensions.get('window').width;

const BitcoinChart: React.FC<BitcoinChartProps> = ({ 
  data, 
  timestamps, 
  labels, 
  timeframe,
  error
}) => {
  // Initialize toast
  const toast = useToast();
  
  // Show error toast when error prop changes to true
  useEffect(() => {
    if (error) {
      toast.show({
        placement: "top",
        duration: 5000,
        render: ({ id }) => {
          const toastId = "error-toast-" + id;
          return (
            <Toast nativeID={toastId} action="error" variant="solid" style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ marginRight: 12 }}>
                <ErrorIcon size={24} color="#FFFFFF" />
              </View>
              <View>
                <ToastTitle>Error</ToastTitle>
                <ToastDescription>Failed to fetch Bitcoin price data. Please try again later.</ToastDescription>
              </View>
            </Toast>
          );
        },
      });
    }
  }, [error, toast]);
  
  // State for tooltip visibility and data
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [activePoint, setActivePoint] = useState({
    x: 0,         // X position for the tooltip and line
    dataIndex: 0,  // Index in the data array
    price: 0,      // Price value at this point
    date: '',      // Formatted date at this point
  });
  
  // Reset state when timeframe changes
  useEffect(() => {
    setTooltipVisible(false);
  }, [timeframe, data]);
  
  // Animated values for smooth movement
  const lineXPosition = useRef(new RNAnimated.Value(0)).current;
  
  // Chart dimensions
  const chartWidth = screenWidth;
  
  // Ensure we have valid data to display
  const safeData = data && data.length > 0 ? data : [0, 0];
  const safeTimestamps = timestamps && timestamps.length > 0 ? timestamps : [Date.now(), Date.now() + 1000];
  const safeLabels = labels && labels.length > 0 ? labels : ['', ''];
  
  // Find min and max values to ensure proper vertical scaling
  const minValue = useMemo(() => {
    if (safeData.length === 0) return 0;
    const min = Math.min(...safeData);
    // Add 5% padding below the minimum for better visual appearance
    return min * 0.95;
  }, [safeData]);
  
  const maxValue = useMemo(() => {
    if (safeData.length === 0) return 0;
    const max = Math.max(...safeData);
    // Add 5% padding above the maximum for better visual appearance
    return max * 1.05;
  }, [safeData]);
  
  // Use the actual data without modifications
  const chartData = useMemo(() => ({
    labels: safeLabels,
    datasets: [
      {
        data: safeData,
        color: () => 'rgba(0, 215, 130, 1)',
        strokeWidth: 4,
      },
    ],
  }), [safeData, safeLabels]);
  
  // Handle touch events
  const handleTouch = (locationX: number, locationY: number) => {
    // Don't process touches outside the chart area
    if (locationY < 0 || locationY > CHART_HEIGHT || 
        locationX < 0 || locationX > chartWidth) {
      setTooltipVisible(false);
      return;
    }
    
    // Calculate which data point we're closest to based on touch position
    const dataIndex = Math.min(
      Math.max(0, Math.floor((locationX / chartWidth) * safeData.length)),
      safeData.length - 1
    );
    
    // Get data for this point
    const price = safeData[dataIndex];
    const timestamp = safeTimestamps[dataIndex];
    const date = formatDate(timestamp, timeframe);
    
    // Update state with all the information we need
    setActivePoint({
      x: locationX,
      dataIndex,
      price,
      date,
    });
    
    // Update animated values
    RNAnimated.timing(lineXPosition, {
      toValue: locationX,
      duration: 0,
      useNativeDriver: true
    }).start();
    
    // Show tooltip
    setTooltipVisible(true);
  };
  
  // Create pan responder for touch handling
  const panResponder = useRef(
    PanResponder.create({
      // Claim responder when touch starts
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      
      // Handle touch move
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        handleTouch(locationX, locationY);
      },
      
      // Handle touch start
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        handleTouch(locationX, locationY);
      },
      
      // Handle touch end
      onPanResponderRelease: () => {
        setTooltipVisible(false);
      },
      
      onPanResponderTerminate: () => {
        setTooltipVisible(false);
      }
    })
  ).current;
  
  // Memoize chart config to prevent unnecessary re-renders
  const chartConfig = useMemo(() => ({
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    fillShadowGradientFrom: 'rgba(0, 215, 130, 0.25)',
    fillShadowGradientTo: 'rgba(0, 215, 130, 0)',
    color: () => 'rgba(0, 215, 130, 1)',
    strokeWidth: 4,
    decimalPlaces: 0,
    linejoinType: 'round' as 'round',
    propsForDots: {
      r: '0',
    },
    propsForVerticalLabels: {
      opacity: 0,
    },
    propsForHorizontalLabels: {
      opacity: 0,
    },
    // Ensure min and max values are respected
    formatYLabel: (value: string) => value,
    // Control the min and max values directly
    min: minValue,
    max: maxValue,
  }), [minValue, maxValue]);
  
  return (
    <View style={styles.chartWrapper}>
      <View style={styles.chartContainer}>
        <LineChart
          key={`chart-${timeframe}`} // Force re-render when timeframe changes
          data={chartData}
          width={chartWidth}
          height={CHART_HEIGHT}
          chartConfig={chartConfig}
          bezier={true}
          withHorizontalLines={false}
          withVerticalLines={false}
          withDots={false}
          withInnerLines={false}
          withOuterLines={false}
          withVerticalLabels={false}
          withHorizontalLabels={false}
          withShadow={false}
          style={styles.chart}
          segments={4}
          fromZero={false}
        />
        
        {/* Touch overlay - captures touch events exactly aligned with the chart */}
        <View
          style={styles.touchOverlay}
          {...panResponder.panHandlers}
        />
        
        {tooltipVisible && (
          <>
            {/* Vertical guide line */}
            <RNAnimated.View
              style={[
                styles.tooltipLine,
                {
                  transform: [{ translateX: lineXPosition }]
                }
              ]}
            />
            
            {/* Price tooltip */}
            <RNAnimated.View
              style={[
                styles.tooltip,
                {
                  left: activePoint.x > chartWidth / 2 
                    ? activePoint.x - 125  // right side - move left
                    : activePoint.x - 25   // left side - move right slightly
                }
              ]}
            >
              <Text style={styles.tooltipDate}>{activePoint.date}</Text>
              <Text style={styles.tooltipPrice}>
                {formatCurrency(activePoint.price)}
              </Text>
            </RNAnimated.View>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  chartWrapper: {
    marginTop: 10,
    height: CHART_HEIGHT,
    width: screenWidth,
    overflow: 'hidden',
  },
  chartContainer: {
    height: CHART_HEIGHT,
    width: screenWidth,
    position: 'relative',
  },
  chart: {
    paddingRight: 0,
    paddingLeft: 0,
    paddingTop: 0,
    paddingBottom: 0,
  },
  touchOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
  tooltipLine: {
    position: 'absolute',
    top: 0,
    height: CHART_HEIGHT,
    width: 1.5,
    backgroundColor: '#000000',
    borderStyle: 'dotted',
    borderWidth: 1,
    borderColor: '#000000',
  },
  tooltip: {
    position: 'absolute',
    backgroundColor: '#000000',
    borderRadius: 8,
    padding: 12,
    width: 150,
    top: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 6,
  },
  tooltipDate: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    marginBottom: 4,
    opacity: 0.8,
  },
  tooltipPrice: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'IBMPlexMono-Bold',
  },
});

export default BitcoinChart; 