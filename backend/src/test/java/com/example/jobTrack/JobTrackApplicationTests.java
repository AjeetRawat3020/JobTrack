package com.example.jobTrack;

import com.example.jobTrack.entity.Job;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.assertEquals;

class JobTrackApplicationTests {

	@Test
	void basicMathTest(){
		int result = 2 + 3;

		assertEquals(5, result);
	}

	@Test
	void jobTitleGetterSetterTest(){
		Job job = new Job();

		job.setTitle("Java Developer");

		assertEquals("Java Developer", job.getTitle());
	}

}
